#!/usr/bin/env node

/**
 * Data Integrity Check Script
 * 
 * This script checks for orphaned records in the database.
 * Since PostgreSQL doesn't allow subqueries in index predicates,
 * we use application-level checks instead.
 * 
 * Usage: node scripts/check-orphaned-records.js
 */

const { createModels } = require("../lib/models");
const { logger } = require("../lib/helpers/logger");
const { AzureStorageService } = require("../lib/helpers/azure-storage");

const checkOrphanedRecords = async () => {
  const databaseConfig = {
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  const storage = new AzureStorageService();
  const models = await createModels(databaseConfig, false, false, storage);

  try {
    logger.info("Starting orphaned records check...");

    // Check for orphaned tender items
    const orphanedTenderItems = await models.sequelize.query(`
      SELECT ti.id, ti.tender_id, ti.name
      FROM tender_items ti
      LEFT JOIN tenders t ON ti.tender_id = t.id
      WHERE t.id IS NULL
    `, { type: models.sequelize.QueryTypes.SELECT });

    if (orphanedTenderItems.length > 0) {
      logger.warn(`Found ${orphanedTenderItems.length} orphaned tender items:`, orphanedTenderItems);
    } else {
      logger.info("✓ No orphaned tender items found");
    }

    // Check for orphaned project items
    const orphanedProjectItems = await models.sequelize.query(`
      SELECT pi.id, pi.project_id, pi.name
      FROM project_items pi
      LEFT JOIN projects p ON pi.project_id = p.id
      WHERE p.id IS NULL
    `, { type: models.sequelize.QueryTypes.SELECT });

    if (orphanedProjectItems.length > 0) {
      logger.warn(`Found ${orphanedProjectItems.length} orphaned project items:`, orphanedProjectItems);
    } else {
      logger.info("✓ No orphaned project items found");
    }

    // Check for orphaned executions
    const orphanedExecutions = await models.sequelize.query(`
      SELECT e.id, e.project_id, e.employee_id
      FROM executions e
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE p.id IS NULL
    `, { type: models.sequelize.QueryTypes.SELECT });

    if (orphanedExecutions.length > 0) {
      logger.warn(`Found ${orphanedExecutions.length} orphaned executions:`, orphanedExecutions);
    } else {
      logger.info("✓ No orphaned executions found");
    }

    // Check for orphaned invoices
    const orphanedInvoices = await models.sequelize.query(`
      SELECT i.id, i.project_id, i.invoice_number
      FROM invoices i
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE p.id IS NULL
    `, { type: models.sequelize.QueryTypes.SELECT });

    if (orphanedInvoices.length > 0) {
      logger.warn(`Found ${orphanedInvoices.length} orphaned invoices:`, orphanedInvoices);
    } else {
      logger.info("✓ No orphaned invoices found");
    }

    // Check for orphaned documents
    const orphanedDocuments = await models.sequelize.query(`
      SELECT d.id, d.owner_id, d.owner_type, d.name
      FROM documents d
      LEFT JOIN users u ON d.owner_id = u.id AND d.owner_type = 'user'
      LEFT JOIN projects p ON d.owner_id = p.id AND d.owner_type = 'project'
      LEFT JOIN tenders t ON d.owner_id = t.id AND d.owner_type = 'tender'
      LEFT JOIN milestones m ON d.owner_id = m.id AND d.owner_type = 'milestone'
      WHERE u.id IS NULL AND p.id IS NULL AND t.id IS NULL AND m.id IS NULL
    `, { type: models.sequelize.QueryTypes.SELECT });

    if (orphanedDocuments.length > 0) {
      logger.warn(`Found ${orphanedDocuments.length} orphaned documents:`, orphanedDocuments);
    } else {
      logger.info("✓ No orphaned documents found");
    }

    logger.info("Orphaned records check completed!");

  } catch (error) {
    logger.error("Error checking orphaned records:", error);
    throw error;
  } finally {
    await models.sequelize.close();
  }
};

// Run the script if called directly
if (require.main === module) {
  checkOrphanedRecords()
    .then(() => {
      logger.info("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Script failed:", error);
      process.exit(1);
    });
}

module.exports = { checkOrphanedRecords };

