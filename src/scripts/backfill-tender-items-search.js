#!/usr/bin/env node

/**
 * Script to backfill the tender_items_search table
 * This script will rebuild the entire search table from the current items data
 */

const { create: createContext } = require('../context');

async function backfillTenderItemsSearch() {
  console.log('Starting tender items search backfill...');

  // Create context (which includes models and services)
  const context = await createContext();

  try {
    // Run backfill
    const result = await context.services.tenderItemsSearch.backfillSearchTable(context);

    console.log(`Backfill completed successfully!`);
    console.log(`- Processed: ${result.processed} items`);
    console.log(`- Errors: ${result.errors} items`);

    if (result.errors > 0) {
      console.warn(`Warning: ${result.errors} items failed to process. Check the logs for details.`);
    }

  } catch (error) {
    console.error('Error during backfill:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    if (context && context.models && context.models.sequelize) {
      await context.models.sequelize.close();
    }
  }
}

// Run the script
if (require.main === module) {
  backfillTenderItemsSearch();
}

module.exports = { backfillTenderItemsSearch };
