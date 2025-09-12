#!/usr/bin/env node

/**
 * Test script to verify the cleanup functionality
 * This creates some test duplicates and then cleans them up
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

async function createTestDuplicates() {
  try {
    console.log('🧪 Creating test duplicate tender numbers...');

    // First, let's find a valid contractor and tenant
    const contractor = await sequelize.query(`
      SELECT id, offer_num, tenant_id FROM companies 
      WHERE type = 'contractor' AND offer_num IS NOT NULL 
      LIMIT 1
    `, { type: Sequelize.QueryTypes.SELECT });

    if (contractor.length === 0) {
      console.log('❌ No contractors found with offer_num. Please create a contractor first.');
      return false;
    }

    const contractorData = contractor[0];
    console.log(`Using contractor: ${contractorData.offer_num} (ID: ${contractorData.id})`);

    // Create some test tenders with duplicate numbers
    const testNumber = `${contractorData.offer_num}-2024-999`;

    // Check if test tenders already exist
    const existing = await sequelize.query(`
      SELECT id FROM tenders WHERE number = :number AND tenant_id = :tenantId
    `, {
      replacements: { number: testNumber, tenantId: contractorData.tenant_id },
      type: Sequelize.QueryTypes.SELECT
    });

    if (existing.length > 0) {
      console.log('🧹 Cleaning up existing test data...');
      await sequelize.query(`
        DELETE FROM tenders WHERE number = :number AND tenant_id = :tenantId
      `, {
        replacements: { number: testNumber, tenantId: contractorData.tenant_id },
        type: Sequelize.QueryTypes.DELETE
      });
    }

    // Create 3 test tenders with the same number
    for (let i = 0; i < 3; i++) {
      await sequelize.query(`
        INSERT INTO tenders (
          status, type, number, vat_key, currency, customer_id, contractor_id, 
          location_id, contact_id, tenant_id, created_by, created_on
        ) VALUES (
          'inquiry', 'test', :number, 'standard', 'EUR', 
          :customerId, :contractorId, :locationId, :contactId, 
          :tenantId, 1, NOW()
        )
      `, {
        replacements: {
          number: testNumber,
          customerId: 1, // Assuming customer ID 1 exists
          contractorId: contractorData.id,
          locationId: 1, // Assuming location ID 1 exists
          contactId: 1, // Assuming contact ID 1 exists
          tenantId: contractorData.tenant_id
        },
        type: Sequelize.QueryTypes.INSERT
      });
    }

    console.log(`✅ Created 3 test tenders with duplicate number: ${testNumber}`);
    return true;

  } catch (error) {
    console.error('❌ Error creating test duplicates:', error.message);
    return false;
  }
}

async function verifyCleanup() {
  try {
    console.log('🔍 Verifying cleanup results...');

    // Check for any remaining duplicates
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
      console.log('✅ Verification passed: No duplicate tender numbers found!');
    } else {
      console.log('⚠️  Warning: Duplicates still exist:');
      duplicates.forEach(dup => {
        console.log(`  - Tenant ${dup.tenant_id}: "${dup.number}" (${dup.count} duplicates)`);
      });
    }

    // Show all tender numbers for the test contractor
    const allTenders = await sequelize.query(`
      SELECT id, number, created_on 
      FROM tenders 
      WHERE contractor_id = :contractorId 
      ORDER BY created_on DESC
      LIMIT 10
    `, {
      replacements: { contractorId: 1 }, // Assuming contractor ID 1
      type: Sequelize.QueryTypes.SELECT
    });

    console.log('\n📋 Recent tender numbers:');
    allTenders.forEach(tender => {
      console.log(`  - ID ${tender.id}: ${tender.number || 'No number'} (${tender.created_on})`);
    });

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
}

async function runTest() {
  try {
    console.log('🚀 Starting tender number cleanup test...\n');

    // Step 1: Create test duplicates
    const created = await createTestDuplicates();
    if (!created) {
      return;
    }

    console.log('\n' + '='.repeat(50));
    console.log('Now run the cleanup script: node cleanup-tender-duplicates.js');
    console.log('='.repeat(50) + '\n');

    // Step 2: Wait for user to run cleanup
    console.log('⏳ Waiting for cleanup to complete...');
    console.log('Press Ctrl+C to exit, or run the cleanup script in another terminal');

    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\n🔍 Running verification...');
      await verifyCleanup();
      await sequelize.close();
      process.exit(0);
    });

    // Auto-verify after 30 seconds
    setTimeout(async () => {
      console.log('\n🔍 Auto-running verification...');
      await verifyCleanup();
      await sequelize.close();
      process.exit(0);
    }, 30000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// Run the test
runTest();
