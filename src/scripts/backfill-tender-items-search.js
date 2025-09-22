#!/usr/bin/env node

/**
 * Script to backfill the tender_items_search table
 * This script will rebuild the entire search table from the current items data
 */

const { createModels } = require('../models');
const { createServices } = require('../services');
const { createContext } = require('../context');
const config = require('config');

async function backfillTenderItemsSearch() {
  console.log('Starting tender items search backfill...');
  
  try {
    // Create database connection
    const models = await createModels(config.get('database'), false, false, null);
    
    // Create services
    const services = createServices();
    
    // Create context
    const context = createContext(models, services, console);
    
    // Run backfill
    const result = await services.tenderItemsSearch.backfillSearchTable(context);
    
    console.log(`Backfill completed successfully!`);
    console.log(`- Processed: ${result.processed} items`);
    console.log(`- Errors: ${result.errors} items`);
    
    if (result.errors > 0) {
      console.warn(`Warning: ${result.errors} items failed to process. Check the logs for details.`);
    }
    
  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (models && models.sequelize) {
      await models.sequelize.close();
    }
  }
}

// Run the script
if (require.main === module) {
  backfillTenderItemsSearch();
}

module.exports = { backfillTenderItemsSearch };
