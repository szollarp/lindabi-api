'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Adding monitoring and maintenance indexes...');

    const createConcurrentIndex = async (sql, indexName, description = '') => {
      console.log(`Creating concurrent index: ${indexName}${description ? ` - ${description}` : ''}`);
      try {
        // Check if index already exists
        const existingIndexes = await queryInterface.sequelize.query(
          `SELECT indexname FROM pg_indexes WHERE indexname = '${indexName}'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (existingIndexes.length > 0) {
          console.log(`⚠ Index already exists: ${indexName} - skipping`);
          return;
        }

        await queryInterface.sequelize.query(sql);
        console.log(`✓ Created concurrent index: ${indexName}`);
      } catch (error) {
        console.error(`✗ Failed to create concurrent index: ${indexName}`, error.message);
        throw error;
      }
    };

    const createIndex = async (tableName, columns, options, description = '') => {
      const indexName = options.name;
      console.log(`Creating index: ${indexName}${description ? ` - ${description}` : ''}`);
      try {
        // Check if index already exists
        const existingIndexes = await queryInterface.sequelize.query(
          `SELECT indexname FROM pg_indexes WHERE indexname = '${indexName}'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (existingIndexes.length > 0) {
          console.log(`⚠ Index already exists: ${indexName} - skipping`);
          return;
        }

        await queryInterface.addIndex(tableName, columns, options);
        console.log(`✓ Created index: ${indexName}`);
      } catch (error) {
        console.error(`✗ Failed to create index: ${indexName}`, error.message);
        throw error;
      }
    };

    // ===========================================
    // AUDIT AND LOGGING INDEXES
    // ===========================================

    // Journey entries by activity type
    await createIndex('journeys', ['activity'], {
      name: 'idx_journeys_activity',
      concurrently: true
    }, 'Journey entries by activity type');

    // Journey entries by property (for tracking specific field changes)
    await createIndex('journeys', ['property'], {
      name: 'idx_journeys_property',
      concurrently: true
    }, 'Journey entries by property (for tracking specific field changes)');

    // ===========================================
    // CLEANUP AND MAINTENANCE INDEXES
    // ===========================================

    // Soft deleted records for cleanup
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_users_soft_deleted 
      ON users (deleted_on) 
      WHERE deleted_on IS NOT NULL;
    `, 'idx_users_soft_deleted', 'Soft deleted records for cleanup');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_items_soft_deleted 
      ON items (deleted_on) 
      WHERE deleted_on IS NOT NULL;
    `, 'idx_items_soft_deleted', 'Soft deleted items for cleanup');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_forgotten_password_tokens_expired 
      ON forgotten_password_tokens (expired_on) 
      WHERE expired_on < '2025-01-01';
    `, 'idx_forgotten_password_tokens_expired', 'Expired forgotten password tokens for cleanup');

    // ===========================================
    // PERFORMANCE MONITORING INDEXES
    // ===========================================

    // Large tables by size for monitoring - using a fixed date approach
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_journeys_large_table 
      ON journeys (created_on, owner_type) 
      WHERE created_on < '2023-01-01';
    `, 'idx_journeys_large_table', 'Large tables by size for monitoring');

    // ===========================================
    // DATA INTEGRITY INDEXES
    // ===========================================

    // Note: Orphaned record detection indexes removed due to PostgreSQL limitation
    // Subqueries are not allowed in index predicates. Use application-level checks instead.

    // ===========================================
    // REPORTING AND ANALYTICS INDEXES
    // ===========================================

    // Monthly execution summaries - using date column directly for better compatibility
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_executions_monthly 
      ON executions (due_date, tenant_id, status);
    `, 'idx_executions_monthly', 'Monthly execution summaries');

    // Monthly financial transaction summaries - using date column directly for better compatibility
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_financial_transactions_monthly 
      ON financial_transactions (date, tenant_id);
    `, 'idx_financial_transactions_monthly', 'Monthly financial transaction summaries');

    // ===========================================
    // SEARCH OPTIMIZATION INDEXES
    // ===========================================

    // Multi-column search for companies
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_companies_search 
      ON companies USING gin ((name || ' ' || COALESCE(tax_number, '') || ' ' || COALESCE(email, '')) gin_trgm_ops);
    `, 'idx_companies_search', 'Multi-column search for companies');

    // Multi-column search for users
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_users_search 
      ON users USING gin ((name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone_number, '')) gin_trgm_ops);
    `, 'idx_users_search', 'Multi-column search for users');

    // Multi-column search for contacts
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_contacts_search 
      ON contacts USING gin ((name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone_number, '')) gin_trgm_ops);
    `, 'idx_contacts_search', 'Multi-column search for contacts');

    // ===========================================
    // PARTITIONING SUPPORT INDEXES
    // ===========================================

    // Date-based partitioning support for large tables
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_journeys_partition 
      ON journeys (created_on, owner_type) 
      WHERE created_on >= '2024-01-01';
    `, 'idx_journeys_partition', 'Date-based partitioning support for large tables');

    // ===========================================
    // CASCADE DELETE OPTIMIZATION
    // ===========================================

    // Optimize cascade deletes for user-related data
    await createIndex('executions', ['employee_id', 'tenant_id'], {
      name: 'idx_executions_cascade_delete',
      concurrently: true
    }, 'Optimize cascade deletes for executions');

    await createIndex('invoices', ['employee_id', 'tenant_id'], {
      name: 'idx_invoices_cascade_delete',
      concurrently: true
    }, 'Optimize cascade deletes for invoices');

    await createIndex('order_forms', ['employee_id', 'tenant_id'], {
      name: 'idx_order_forms_cascade_delete',
      concurrently: true
    }, 'Optimize cascade deletes for order forms');

    await createIndex('completion_certificates', ['employee_id', 'tenant_id'], {
      name: 'idx_completion_certificates_cascade_delete',
      concurrently: true
    }, 'Optimize cascade deletes for completion certificates');

    // ===========================================
    // CONCURRENT ACCESS OPTIMIZATION
    // ===========================================

    // Reduce lock contention on frequently updated tables
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_tender_number_counters_concurrent 
      ON tender_number_counters (tenant_id, contractor_id, year) ;
    `, 'idx_tender_number_counters_concurrent', 'Reduce lock contention on frequently updated tables');

    // ===========================================
    // STATISTICS COLLECTION INDEXES
    // ===========================================

    // Enable better statistics collection
    await createIndex('users', ['tenant_id', 'entity', 'status', 'created_on'], {
      name: 'idx_users_stats',
      concurrently: true
    }, 'Enable better statistics collection for users');

    await createIndex('projects', ['tenant_id', 'status', 'type', 'created_on'], {
      name: 'idx_projects_stats',
      concurrently: true
    }, 'Enable better statistics collection for projects');

    await createIndex('executions', ['tenant_id', 'status', 'due_date'], {
      name: 'idx_executions_stats',
      concurrently: true
    }, 'Enable better statistics collection for executions');

    console.log('Monitoring and maintenance indexes added successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Removing monitoring and maintenance indexes...');

    const dropIndex = async (indexName, description = '') => {
      console.log(`Dropping index: ${indexName}${description ? ` - ${description}` : ''}`);
      try {
        await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${indexName};`);
        console.log(`✓ Dropped index: ${indexName}`);
      } catch (error) {
        console.warn(`⚠ Failed to drop index: ${indexName}`, error.message);
      }
    };

    const indexes = [
      // Statistics collection
      { name: 'idx_executions_stats', desc: 'Enable better statistics collection for executions' },
      { name: 'idx_projects_stats', desc: 'Enable better statistics collection for projects' },
      { name: 'idx_users_stats', desc: 'Enable better statistics collection for users' },

      // Concurrent access
      { name: 'idx_tender_number_counters_concurrent', desc: 'Reduce lock contention on frequently updated tables' },

      // Cascade delete optimization
      { name: 'idx_completion_certificates_cascade_delete', desc: 'Optimize cascade deletes for completion certificates' },
      { name: 'idx_order_forms_cascade_delete', desc: 'Optimize cascade deletes for order forms' },
      { name: 'idx_invoices_cascade_delete', desc: 'Optimize cascade deletes for invoices' },
      { name: 'idx_executions_cascade_delete', desc: 'Optimize cascade deletes for executions' },

      // Partitioning support
      { name: 'idx_journeys_partition', desc: 'Date-based partitioning support for large tables' },

      // Search optimization
      { name: 'idx_contacts_search', desc: 'Multi-column search for contacts' },
      { name: 'idx_users_search', desc: 'Multi-column search for users' },
      { name: 'idx_companies_search', desc: 'Multi-column search for companies' },

      // Reporting and analytics
      { name: 'idx_financial_transactions_monthly', desc: 'Monthly financial transaction summaries' },
      { name: 'idx_executions_monthly', desc: 'Monthly execution summaries' },

      // Data integrity - orphaned record indexes removed due to PostgreSQL limitations

      // Performance monitoring
      { name: 'idx_journeys_large_table', desc: 'Large tables by size for monitoring' },

      // Cleanup and maintenance
      { name: 'idx_forgotten_password_tokens_expired', desc: 'Expired forgotten password tokens for cleanup' },
      { name: 'idx_items_soft_deleted', desc: 'Soft deleted items for cleanup' },
      { name: 'idx_users_soft_deleted', desc: 'Soft deleted records for cleanup' },

      // Audit and logging
      { name: 'idx_journeys_property', desc: 'Journey entries by property (for tracking specific field changes)' },
      { name: 'idx_journeys_activity', desc: 'Journey entries by activity type' }
    ];

    for (const { name, desc } of indexes) {
      await dropIndex(name, desc);
    }

    console.log('Monitoring and maintenance indexes removed successfully!');
  }
};