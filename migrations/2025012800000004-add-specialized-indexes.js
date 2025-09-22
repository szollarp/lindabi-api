'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Adding specialized indexes...');

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

    // ===========================================
    // PARTIAL INDEXES FOR COMMON FILTERS
    // ===========================================

    // Active users only (where status = 'active')
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_users_active_tenant 
      ON users (tenant_id, name) 
      WHERE status = 'active';
    `, 'idx_users_active_tenant', 'Active users only');

    // Active companies only
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_companies_active_tenant 
      ON companies (tenant_id, name) 
      WHERE status = 'active';
    `, 'idx_companies_active_tenant', 'Active companies only');

    // Active contacts only
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_contacts_active_tenant 
      ON contacts (tenant_id, name) 
      WHERE status = 'active';
    `, 'idx_contacts_active_tenant', 'Active contacts only');

    // Active locations only
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_locations_active_tenant 
      ON locations (tenant_id, name) 
      WHERE status = 'active';
    `, 'idx_locations_active_tenant', 'Active locations only');

    // ===========================================
    // DATE-BASED PARTIAL INDEXES
    // ===========================================

    // Recent executions (last 30 days) - using a fixed date approach
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_executions_recent 
      ON executions (employee_id, due_date) 
      WHERE due_date >= '2020-01-01';
    `, 'idx_executions_recent', 'Recent executions (last 30 days)');

    // Recent financial transactions (last 90 days) - using a fixed date approach
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_financial_transactions_recent 
      ON financial_transactions (tenant_id, date) 
      WHERE date >= '2020-01-01';
    `, 'idx_financial_transactions_recent', 'Recent financial transactions (last 90 days)');

    // ===========================================
    // STATUS-SPECIFIC INDEXES
    // ===========================================

    // Pending executions
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_executions_pending 
      ON executions (employee_id, due_date) 
      WHERE status = 'pending';
    `, 'idx_executions_pending', 'Pending executions');

    // Approved executions
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_executions_approved 
      ON executions (employee_id, due_date) 
      WHERE status = 'approved';
    `, 'idx_executions_approved', 'Approved executions');

    // Unread notifications
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_notifications_unread 
      ON notifications (user_id, created_on) 
      WHERE status = 'unread';
    `, 'idx_notifications_unread', 'Unread notifications');

    // ===========================================
    // COMPOSITE INDEXES FOR COMPLEX QUERIES
    // ===========================================

    // User + entity + status for user listing
    await createIndex('users', ['tenant_id', 'entity', 'status', 'name'], {
      name: 'idx_users_tenant_entity_status_name',
      concurrently: true
    }, 'User + entity + status for user listing');

    // Project + status + due_date for project listing
    await createIndex('projects', ['tenant_id', 'status', 'due_date'], {
      name: 'idx_projects_tenant_status_due_date',
      concurrently: true
    }, 'Project + status + due_date for project listing');

    // Execution + employee + status + due_date for payroll
    await createIndex('executions', ['tenant_id', 'employee_id', 'status', 'due_date'], {
      name: 'idx_executions_tenant_employee_status_due_date',
      concurrently: true
    }, 'Execution + employee + status + due_date for payroll');

    // ===========================================
    // FOREIGN KEY COMPOSITE INDEXES
    // ===========================================

    // Tender items with tender and position
    await createIndex('tender_items', ['tender_id', 'num', 'name'], {
      name: 'idx_tender_items_tender_num_name',
      concurrently: true
    }, 'Tender items with tender and position');

    // Project items with project and position
    await createIndex('project_items', ['project_id', 'num', 'name'], {
      name: 'idx_project_items_project_num_name',
      concurrently: true
    }, 'Project items with project and position');

    // ===========================================
    // TEXT SEARCH COMPOSITE INDEXES
    // ===========================================

    // Company name + type for contractor/customer filtering
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_companies_name_type_trgm 
      ON companies USING gin ((name || ' ' || COALESCE(type, '')) gin_trgm_ops);
    `, 'idx_companies_name_type_trgm', 'Company name + type for contractor/customer filtering');

    // User name + email for search
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_users_name_email_trgm 
      ON users USING gin ((name || ' ' || COALESCE(email, '')) gin_trgm_ops);
    `, 'idx_users_name_email_trgm', 'User name + email for search');

    // ===========================================
    // COVERING INDEXES FOR COMMON QUERIES
    // ===========================================

    // Covering index for user list (includes commonly selected fields)
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_users_covering_list 
      ON users (tenant_id, entity, status) 
      INCLUDE (id, name, email, created_on, updated_on);
    `, 'idx_users_covering_list', 'Covering index for user list');

    // Covering index for project list
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_projects_covering_list 
      ON projects (tenant_id, status) 
      INCLUDE (id, name, number, due_date, created_on, updated_on);
    `, 'idx_projects_covering_list', 'Covering index for project list');

    // Covering index for execution list
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_executions_covering_list 
      ON executions (tenant_id, employee_id, status) 
      INCLUDE (id, due_date, quantity, settlement, created_on);
    `, 'idx_executions_covering_list', 'Covering index for execution list');

    // ===========================================
    // UNIQUE CONSTRAINTS WITH INDEXES
    // ===========================================

    // Ensure unique email per tenant
    await createIndex('users', ['email', 'tenant_id'], {
      name: 'idx_users_email_tenant_unique',
      unique: true,
      concurrently: true
    }, 'Ensure unique email per tenant');

    // Ensure unique tax number per tenant
    await createIndex('companies', ['tax_number', 'tenant_id'], {
      name: 'idx_companies_tax_number_tenant_unique',
      unique: true,
      concurrently: true
    }, 'Ensure unique tax number per tenant');

    // ===========================================
    // FUNCTIONAL INDEXES
    // ===========================================

    // Index on lowercased names for case-insensitive searches
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_users_name_lower 
      ON users (LOWER(name));
    `, 'idx_users_name_lower', 'Index on lowercased names for case-insensitive searches');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_companies_name_lower 
      ON companies (LOWER(name));
    `, 'idx_companies_name_lower', 'Index on lowercased company names');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_contacts_name_lower 
      ON contacts (LOWER(name));
    `, 'idx_contacts_name_lower', 'Index on lowercased contact names');

    // ===========================================
    // EXPRESSION INDEXES
    // ===========================================

    // Index on company name + type for filtering
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_companies_name_type 
      ON companies ((name || ' ' || COALESCE(type, '')));
    `, 'idx_companies_name_type', 'Index on company name + type for filtering');

    console.log('Specialized indexes added successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Removing specialized indexes...');

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
      // Expression indexes
      { name: 'idx_companies_name_type', desc: 'Index on company name + type for filtering' },

      // Functional indexes
      { name: 'idx_contacts_name_lower', desc: 'Index on lowercased contact names' },
      { name: 'idx_companies_name_lower', desc: 'Index on lowercased company names' },
      { name: 'idx_users_name_lower', desc: 'Index on lowercased names for case-insensitive searches' },

      // Unique constraints
      { name: 'idx_companies_tax_number_tenant_unique', desc: 'Ensure unique tax number per tenant' },
      { name: 'idx_users_email_tenant_unique', desc: 'Ensure unique email per tenant' },

      // Covering indexes
      { name: 'idx_executions_covering_list', desc: 'Covering index for execution list' },
      { name: 'idx_projects_covering_list', desc: 'Covering index for project list' },
      { name: 'idx_users_covering_list', desc: 'Covering index for user list' },

      // Text search composite
      { name: 'idx_users_name_email_trgm', desc: 'User name + email for search' },
      { name: 'idx_companies_name_type_trgm', desc: 'Company name + type for contractor/customer filtering' },

      // Foreign key composite
      { name: 'idx_project_items_project_num_name', desc: 'Project items with project and position' },
      { name: 'idx_tender_items_tender_num_name', desc: 'Tender items with tender and position' },

      // Complex composite
      { name: 'idx_executions_tenant_employee_status_due_date', desc: 'Execution + employee + status + due_date for payroll' },
      { name: 'idx_projects_tenant_status_due_date', desc: 'Project + status + due_date for project listing' },
      { name: 'idx_users_tenant_entity_status_name', desc: 'User + entity + status for user listing' },

      // Status-specific
      { name: 'idx_notifications_unread', desc: 'Unread notifications' },
      { name: 'idx_executions_approved', desc: 'Approved executions' },
      { name: 'idx_executions_pending', desc: 'Pending executions' },

      // Date-based
      { name: 'idx_financial_transactions_recent', desc: 'Recent financial transactions (last 90 days)' },
      { name: 'idx_executions_recent', desc: 'Recent executions (last 30 days)' },

      // Partial indexes
      { name: 'idx_locations_active_tenant', desc: 'Active locations only' },
      { name: 'idx_contacts_active_tenant', desc: 'Active contacts only' },
      { name: 'idx_companies_active_tenant', desc: 'Active companies only' },
      { name: 'idx_users_active_tenant', desc: 'Active users only' }
    ];

    for (const { name, desc } of indexes) {
      await dropIndex(name, desc);
    }

    console.log('Specialized indexes removed successfully!');
  }
};