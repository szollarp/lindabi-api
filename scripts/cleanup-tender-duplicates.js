#!/usr/bin/env node

/**
 * Script to clean up duplicate tender numbers
 * Run this before applying the unique constraint migration
 */

const { Sequelize } = require('sequelize');
const config = require('./config.json');

// Database connection
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: false,
  dialectOptions: config.dialectOptions,
  ssl: config.ssl
});

// Helper function to generate proper tender numbers using the same logic as the service
async function generateProperTenderNumber(sequelize, tender) {
  // Get contractor info
  const contractor = await sequelize.query(`
    SELECT offer_num FROM companies 
    WHERE id = :contractorId AND type = 'contractor' AND tenant_id = :tenantId
  `, {
    replacements: {
      contractorId: tender.contractor_id,
      tenantId: tender.tenant_id
    },
    type: Sequelize.QueryTypes.SELECT
  });

  if (!contractor.length || !contractor[0].offer_num) {
    throw new Error(`Contractor not found or missing offerNum for tender ${tender.id}`);
  }

  const year = new Date(tender.created_on).getUTCFullYear();

  // Use the same atomic sequence generation logic as the service
  const nextTenderSeq = async (sequelize, { tenantId, contractorId, year }) => {
    const t = await sequelize.transaction();
    try {
      const [result] = await sequelize.query(
        `
        INSERT INTO tender_number_counters (tenant_id, contractor_id, year, seq)
        VALUES (:tenantId, :contractorId, :year, 1)
        ON CONFLICT (tenant_id, contractor_id, year) 
        DO UPDATE SET 
          seq = tender_number_counters.seq + 1,
          updated_at = NOW()
        RETURNING seq
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
          replacements: { tenantId, contractorId, year }
        }
      );
      await t.commit();
      return result["seq"];
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const seq = await nextTenderSeq(sequelize, {
    tenantId: tender.tenant_id,
    contractorId: tender.contractor_id,
    year
  });

  return `${contractor[0].offer_num}-${year}-${seq}`;
}

async function cleanupDuplicates() {
  try {
    console.log('🔍 Finding duplicate tender numbers...');

    // Find duplicates with full tender data
    const duplicates = await sequelize.query(`
      SELECT 
        tenant_id,
        number,
        COUNT(*) as count,
        ARRAY_AGG(id ORDER BY created_on) as tender_ids
      FROM tenders 
      WHERE number IS NOT NULL AND number != ''
      GROUP BY tenant_id, number
      HAVING COUNT(*) > 1
      ORDER BY tenant_id, number
    `, { type: Sequelize.QueryTypes.SELECT });

    if (duplicates.length === 0) {
      console.log('✅ No duplicate tender numbers found!');
      return;
    }

    console.log(`📊 Found ${duplicates.length} duplicate number groups:`);
    duplicates.forEach(dup => {
      console.log(`  - Tenant ${dup.tenant_id}: "${dup.number}" (${dup.count} duplicates)`);
    });

    console.log('\n🧹 Cleaning up duplicates with proper tender numbers...');

    let totalCleaned = 0;

    for (const duplicate of duplicates) {
      const tenderIds = duplicate.tender_ids;
      const keepId = tenderIds[0]; // Keep the oldest
      const duplicateIds = tenderIds.slice(1);

      console.log(`  Processing "${duplicate.number}" (keeping ID ${keepId})...`);

      // Get the tender data for the first duplicate to use as template
      const templateTender = await sequelize.query(`
        SELECT * FROM tenders WHERE id = :id
      `, {
        replacements: { id: duplicateIds[0] },
        type: Sequelize.QueryTypes.SELECT
      });

      if (templateTender.length === 0) {
        console.log(`    ⚠️  Could not find tender data for ID ${duplicateIds[0]}, skipping...`);
        continue;
      }

      const tenderData = templateTender[0];

      for (let i = 0; i < duplicateIds.length; i++) {
        try {
          // Generate a proper tender number using the same logic as the service
          const newNumber = await generateProperTenderNumber(sequelize, tenderData);

          // Check if this number already exists (safety check)
          const existingTender = await sequelize.query(`
            SELECT id FROM tenders 
            WHERE number = :number AND tenant_id = :tenantId AND id != :excludeId
          `, {
            replacements: {
              number: newNumber,
              tenantId: tenderData.tenant_id,
              excludeId: duplicateIds[i]
            },
            type: Sequelize.QueryTypes.SELECT
          });

          if (existingTender.length > 0) {
            console.log(`    ⚠️  Generated number "${newNumber}" already exists, retrying...`);
            // Retry with a slightly different approach - add a small delay and try again
            await new Promise(resolve => setTimeout(resolve, 100));
            const retryNumber = await generateProperTenderNumber(sequelize, tenderData);
            console.log(`    - Generated retry number "${retryNumber}" for tender ID ${duplicateIds[i]}`);

            // Update the tender with the retry number
            await sequelize.query(
              'UPDATE tenders SET number = :newNumber WHERE id = :id',
              {
                replacements: { newNumber: retryNumber, id: duplicateIds[i] },
                type: Sequelize.QueryTypes.UPDATE
              }
            );

            console.log(`    ✅ Updated tender ID ${duplicateIds[i]} to "${retryNumber}"`);
          } else {
            console.log(`    - Generated new number "${newNumber}" for tender ID ${duplicateIds[i]}`);

            // Update the tender with the new number
            await sequelize.query(
              'UPDATE tenders SET number = :newNumber WHERE id = :id',
              {
                replacements: { newNumber, id: duplicateIds[i] },
                type: Sequelize.QueryTypes.UPDATE
              }
            );

            console.log(`    ✅ Updated tender ID ${duplicateIds[i]} to "${newNumber}"`);
          }

          totalCleaned++;

          // Update the template tender data for the next iteration to get a different number
          tenderData.created_on = new Date(); // Use current time to potentially get different year/sequence

        } catch (error) {
          console.error(`    ❌ Failed to generate number for tender ID ${duplicateIds[i]}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Cleanup complete! Updated ${totalCleaned} tender numbers.`);

    // Verify no duplicates remain
    const remainingDuplicates = await sequelize.query(`
      SELECT 
        tenant_id,
        number,
        COUNT(*) as count
      FROM tenders 
      WHERE number IS NOT NULL AND number != ''
      GROUP BY tenant_id, number
      HAVING COUNT(*) > 1
    `, { type: Sequelize.QueryTypes.SELECT });

    if (remainingDuplicates.length === 0) {
      console.log('✅ Verification passed: No duplicate tender numbers remain.');
    } else {
      console.log('⚠️  Warning: Some duplicates may still exist:', remainingDuplicates);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the cleanup
cleanupDuplicates();
