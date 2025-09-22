'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Adding performance indexes...');

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
    // USERS TABLE INDEXES
    // ===========================================

    // Tenant + entity composite index (most common query pattern)
    await createIndex('users', ['tenant_id', 'entity'], {
      name: 'idx_users_tenant_entity',
      concurrently: true
    }, 'Tenant + entity composite index');

    // Tenant + status composite index
    await createIndex('users', ['tenant_id', 'status'], {
      name: 'idx_users_tenant_status',
      concurrently: true
    }, 'Tenant + status composite index');

    // Email index for authentication
    await createIndex('users', ['email'], {
      name: 'idx_users_email',
      concurrently: true
    }, 'Email index for authentication');

    // Role foreign key index
    await createIndex('users', ['role_id'], {
      name: 'idx_users_role_id',
      concurrently: true
    }, 'Role foreign key index');

    // Created date index for sorting
    await createIndex('users', ['created_on'], {
      name: 'idx_users_created_on',
      concurrently: true
    }, 'Created date index for sorting');

    // ===========================================
    // COMPANIES TABLE INDEXES
    // ===========================================

    // Tenant + type composite index
    await createIndex('companies', ['tenant_id', 'type'], {
      name: 'idx_companies_tenant_type',
      concurrently: true
    }, 'Tenant + type composite index');

    // Tenant + status composite index
    await createIndex('companies', ['tenant_id', 'status'], {
      name: 'idx_companies_tenant_status',
      concurrently: true
    }, 'Tenant + status composite index');

    // Tax number index for uniqueness checks
    await createIndex('companies', ['tax_number'], {
      name: 'idx_companies_tax_number',
      concurrently: true
    }, 'Tax number index for uniqueness checks');

    // ===========================================
    // CONTACTS TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('contacts', ['tenant_id'], {
      name: 'idx_contacts_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // User foreign key index
    await createIndex('contacts', ['user_id'], {
      name: 'idx_contacts_user_id',
      concurrently: true
    }, 'User foreign key index');

    // Email index for lookups
    await createIndex('contacts', ['email'], {
      name: 'idx_contacts_email',
      concurrently: true
    }, 'Email index for lookups');

    // ===========================================
    // LOCATIONS TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('locations', ['tenant_id'], {
      name: 'idx_locations_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // ===========================================
    // TENDERS TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('tenders', ['tenant_id'], {
      name: 'idx_tenders_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // Tenant + status composite index
    await createIndex('tenders', ['tenant_id', 'status'], {
      name: 'idx_tenders_tenant_status',
      concurrently: true
    }, 'Tenant + status composite index');

    // Customer foreign key index
    await createIndex('tenders', ['customer_id'], {
      name: 'idx_tenders_customer_id',
      concurrently: true
    }, 'Customer foreign key index');

    // Contractor foreign key index
    await createIndex('tenders', ['contractor_id'], {
      name: 'idx_tenders_contractor_id',
      concurrently: true
    }, 'Contractor foreign key index');

    // Location foreign key index
    await createIndex('tenders', ['location_id'], {
      name: 'idx_tenders_location_id',
      concurrently: true
    }, 'Location foreign key index');

    // Contact foreign key index
    await createIndex('tenders', ['contact_id'], {
      name: 'idx_tenders_contact_id',
      concurrently: true
    }, 'Contact foreign key index');

    // Tender number index for uniqueness
    await createIndex('tenders', ['number'], {
      name: 'idx_tenders_number',
      concurrently: true
    }, 'Tender number index for uniqueness');

    // Updated date index for sorting
    await createIndex('tenders', ['updated_on'], {
      name: 'idx_tenders_updated_on',
      concurrently: true
    }, 'Updated date index for sorting');

    // ===========================================
    // TENDER_ITEMS TABLE INDEXES
    // ===========================================

    // Tender foreign key index
    await createIndex('tender_items', ['tender_id'], {
      name: 'idx_tender_items_tender_id',
      concurrently: true
    }, 'Tender foreign key index');

    // Position index for ordering
    await createIndex('tender_items', ['tender_id', 'num'], {
      name: 'idx_tender_items_tender_num',
      concurrently: true
    }, 'Position index for ordering');

    // ===========================================
    // PROJECTS TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('projects', ['tenant_id'], {
      name: 'idx_projects_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // Tenant + status composite index
    await createIndex('projects', ['tenant_id', 'status'], {
      name: 'idx_projects_tenant_status',
      concurrently: true
    }, 'Tenant + status composite index');

    // Customer foreign key index
    await createIndex('projects', ['customer_id'], {
      name: 'idx_projects_customer_id',
      concurrently: true
    }, 'Customer foreign key index');

    // Contractor foreign key index
    await createIndex('projects', ['contractor_id'], {
      name: 'idx_projects_contractor_id',
      concurrently: true
    }, 'Contractor foreign key index');

    // Tender foreign key index
    await createIndex('projects', ['tender_id'], {
      name: 'idx_projects_tender_id',
      concurrently: true
    }, 'Tender foreign key index');

    // Location foreign key index
    await createIndex('projects', ['location_id'], {
      name: 'idx_projects_location_id',
      concurrently: true
    }, 'Location foreign key index');

    // Due date index for scheduling
    await createIndex('projects', ['due_date'], {
      name: 'idx_projects_due_date',
      concurrently: true
    }, 'Due date index for scheduling');

    // ===========================================
    // PROJECT_ITEMS TABLE INDEXES
    // ===========================================

    // Project foreign key index
    await createIndex('project_items', ['project_id'], {
      name: 'idx_project_items_project_id',
      concurrently: true
    }, 'Project foreign key index');

    // Position index for ordering
    await createIndex('project_items', ['project_id', 'num'], {
      name: 'idx_project_items_project_num',
      concurrently: true
    }, 'Position index for ordering');

    // ===========================================
    // ITEMS TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('items', ['tenant_id'], {
      name: 'idx_items_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // Category index for filtering
    await createIndex('items', ['category'], {
      name: 'idx_items_category',
      concurrently: true
    }, 'Category index for filtering');

    // ===========================================
    // EXECUTIONS TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('executions', ['tenant_id'], {
      name: 'idx_executions_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // Employee foreign key index
    await createIndex('executions', ['employee_id'], {
      name: 'idx_executions_employee_id',
      concurrently: true
    }, 'Employee foreign key index');

    // Project foreign key index
    await createIndex('executions', ['project_id'], {
      name: 'idx_executions_project_id',
      concurrently: true
    }, 'Project foreign key index');

    // Project item foreign key index
    await createIndex('executions', ['project_item_id'], {
      name: 'idx_executions_project_item_id',
      concurrently: true
    }, 'Project item foreign key index');

    // Status index
    await createIndex('executions', ['status'], {
      name: 'idx_executions_status',
      concurrently: true
    }, 'Status index');

    // Due date index for date range queries
    await createIndex('executions', ['due_date'], {
      name: 'idx_executions_due_date',
      concurrently: true
    }, 'Due date index for date range queries');

    // Employee + due date composite index for payroll queries
    await createIndex('executions', ['employee_id', 'due_date'], {
      name: 'idx_executions_employee_due_date',
      concurrently: true
    }, 'Employee + due date composite index for payroll queries');

    // ===========================================
    // TASKS TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('tasks', ['tenant_id'], {
      name: 'idx_tasks_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // Project foreign key index
    await createIndex('tasks', ['project_id'], {
      name: 'idx_tasks_project_id',
      concurrently: true
    }, 'Project foreign key index');

    // Column foreign key index
    await createIndex('tasks', ['column_id'], {
      name: 'idx_tasks_column_id',
      concurrently: true
    }, 'Column foreign key index');

    // Position index for ordering
    await createIndex('tasks', ['position'], {
      name: 'idx_tasks_position',
      concurrently: true
    }, 'Position index for ordering');

    // ===========================================
    // TASK_USERS TABLE INDEXES (Many-to-many)
    // ===========================================

    // User foreign key index
    await createIndex('task_users', ['user_id'], {
      name: 'idx_task_users_user_id',
      concurrently: true
    }, 'User foreign key index');

    // Task foreign key index
    await createIndex('task_users', ['task_id'], {
      name: 'idx_task_users_task_id',
      concurrently: true
    }, 'Task foreign key index');

    // ===========================================
    // FINANCIAL_TRANSACTIONS TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('financial_transactions', ['tenant_id'], {
      name: 'idx_financial_transactions_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // Payer foreign key index
    await createIndex('financial_transactions', ['payer_id'], {
      name: 'idx_financial_transactions_payer_id',
      concurrently: true
    }, 'Payer foreign key index');

    // Recipient foreign key index
    await createIndex('financial_transactions', ['recipient_id'], {
      name: 'idx_financial_transactions_recipient_id',
      concurrently: true
    }, 'Recipient foreign key index');

    // Date index for sorting
    await createIndex('financial_transactions', ['date'], {
      name: 'idx_financial_transactions_date',
      concurrently: true
    }, 'Date index for sorting');

    // ===========================================
    // INVOICES TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('invoices', ['tenant_id'], {
      name: 'idx_invoices_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // Project foreign key index
    await createIndex('invoices', ['project_id'], {
      name: 'idx_invoices_project_id',
      concurrently: true
    }, 'Project foreign key index');

    // Employee foreign key index
    await createIndex('invoices', ['employee_id'], {
      name: 'idx_invoices_employee_id',
      concurrently: true
    }, 'Employee foreign key index');

    // Milestone foreign key index
    await createIndex('invoices', ['milestone_id'], {
      name: 'idx_invoices_milestone_id',
      concurrently: true
    }, 'Milestone foreign key index');

    // Status index
    await createIndex('invoices', ['status'], {
      name: 'idx_invoices_status',
      concurrently: true
    }, 'Status index');

    // Invoice number index for uniqueness
    await createIndex('invoices', ['invoice_number'], {
      name: 'idx_invoices_invoice_number',
      concurrently: true
    }, 'Invoice number index for uniqueness');

    // ===========================================
    // DOCUMENTS TABLE INDEXES
    // ===========================================

    // Owner type + owner id composite index
    await createIndex('documents', ['owner_type', 'owner_id'], {
      name: 'idx_documents_owner_type_id',
      concurrently: true
    }, 'Owner type + owner id composite index');

    // Type index for filtering
    await createIndex('documents', ['type'], {
      name: 'idx_documents_type',
      concurrently: true
    }, 'Type index for filtering');

    // ===========================================
    // ITEM_MOVEMENTS TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('item_movements', ['tenant_id'], {
      name: 'idx_item_movements_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // Item foreign key index
    await createIndex('item_movements', ['item_id'], {
      name: 'idx_item_movements_item_id',
      concurrently: true
    }, 'Item foreign key index');

    // Employee foreign key index
    await createIndex('item_movements', ['employee_id'], {
      name: 'idx_item_movements_employee_id',
      concurrently: true
    }, 'Employee foreign key index');

    // Type index
    await createIndex('item_movements', ['type'], {
      name: 'idx_item_movements_type',
      concurrently: true
    }, 'Type index');

    // Created date index for date range queries
    await createIndex('item_movements', ['created_on'], {
      name: 'idx_item_movements_created_on',
      concurrently: true
    }, 'Created date index for date range queries');

    // ===========================================
    // WAREHOUSES TABLE INDEXES
    // ===========================================

    // Tenant index
    await createIndex('warehouses', ['tenant_id'], {
      name: 'idx_warehouses_tenant_id',
      concurrently: true
    }, 'Tenant index');

    // ===========================================
    // SALARIES TABLE INDEXES
    // ===========================================

    // User foreign key index
    await createIndex('salaries', ['user_id'], {
      name: 'idx_salaries_user_id',
      concurrently: true
    }, 'User foreign key index');

    // Date range index for payroll queries
    await createIndex('salaries', ['start_date', 'end_date'], {
      name: 'idx_salaries_date_range',
      concurrently: true
    }, 'Date range index for payroll queries');

    // ===========================================
    // NOTIFICATIONS TABLE INDEXES
    // ===========================================

    // User foreign key index
    await createIndex('notifications', ['user_id'], {
      name: 'idx_notifications_user_id',
      concurrently: true
    }, 'User foreign key index');

    // Status index
    await createIndex('notifications', ['status'], {
      name: 'idx_notifications_status',
      concurrently: true
    }, 'Status index');

    // ===========================================
    // TEXT SEARCH INDEXES
    // ===========================================

    // Enable pg_trgm extension if not already enabled
    console.log('Enabling pg_trgm extension...');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    console.log('✓ Enabled pg_trgm extension');

    // Text search indexes for names and descriptions
    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_users_name_trgm 
      ON users USING gin (name gin_trgm_ops);
    `, 'idx_users_name_trgm', 'Users name text search');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_companies_name_trgm 
      ON companies USING gin (name gin_trgm_ops);
    `, 'idx_companies_name_trgm', 'Companies name text search');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_contacts_name_trgm 
      ON contacts USING gin (name gin_trgm_ops);
    `, 'idx_contacts_name_trgm', 'Contacts name text search');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_locations_name_trgm 
      ON locations USING gin (name gin_trgm_ops);
    `, 'idx_locations_name_trgm', 'Locations name text search');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_items_name_trgm 
      ON items USING gin (name gin_trgm_ops);
    `, 'idx_items_name_trgm', 'Items name text search');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_projects_name_trgm 
      ON projects USING gin (name gin_trgm_ops);
    `, 'idx_projects_name_trgm', 'Projects name text search');

    await createConcurrentIndex(`
      CREATE INDEX CONCURRENTLY idx_tender_items_name_trgm 
      ON tender_items USING gin (name gin_trgm_ops);
    `, 'idx_tender_items_name_trgm', 'Tender items name text search');

    console.log('Performance indexes added successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Removing performance indexes...');

    const dropIndex = async (indexName, description = '') => {
      console.log(`Dropping index: ${indexName}${description ? ` - ${description}` : ''}`);
      try {
        await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${indexName};`);
        console.log(`✓ Dropped index: ${indexName}`);
      } catch (error) {
        console.warn(`⚠ Failed to drop index: ${indexName}`, error.message);
      }
    };

    // Drop all indexes in reverse order
    const indexes = [
      // Text search indexes
      { name: 'idx_tender_items_name_trgm', desc: 'Tender items name text search' },
      { name: 'idx_projects_name_trgm', desc: 'Projects name text search' },
      { name: 'idx_items_name_trgm', desc: 'Items name text search' },
      { name: 'idx_locations_name_trgm', desc: 'Locations name text search' },
      { name: 'idx_contacts_name_trgm', desc: 'Contacts name text search' },
      { name: 'idx_companies_name_trgm', desc: 'Companies name text search' },
      { name: 'idx_users_name_trgm', desc: 'Users name text search' },

      // Notifications
      { name: 'idx_notifications_status', desc: 'Status index' },
      { name: 'idx_notifications_user_id', desc: 'User foreign key index' },

      // Salaries
      { name: 'idx_salaries_date_range', desc: 'Date range index for payroll queries' },
      { name: 'idx_salaries_user_id', desc: 'User foreign key index' },

      // Warehouses
      { name: 'idx_warehouses_tenant_id', desc: 'Tenant index' },

      // Item movements
      { name: 'idx_item_movements_created_on', desc: 'Created date index for date range queries' },
      { name: 'idx_item_movements_type', desc: 'Type index' },
      { name: 'idx_item_movements_employee_id', desc: 'Employee foreign key index' },
      { name: 'idx_item_movements_item_id', desc: 'Item foreign key index' },
      { name: 'idx_item_movements_tenant_id', desc: 'Tenant index' },

      // Documents
      { name: 'idx_documents_type', desc: 'Type index for filtering' },
      { name: 'idx_documents_owner_type_id', desc: 'Owner type + owner id composite index' },

      // Invoices
      { name: 'idx_invoices_invoice_number', desc: 'Invoice number index for uniqueness' },
      { name: 'idx_invoices_status', desc: 'Status index' },
      { name: 'idx_invoices_milestone_id', desc: 'Milestone foreign key index' },
      { name: 'idx_invoices_employee_id', desc: 'Employee foreign key index' },
      { name: 'idx_invoices_project_id', desc: 'Project foreign key index' },
      { name: 'idx_invoices_tenant_id', desc: 'Tenant index' },

      // Financial transactions
      { name: 'idx_financial_transactions_date', desc: 'Date index for sorting' },
      { name: 'idx_financial_transactions_recipient_id', desc: 'Recipient foreign key index' },
      { name: 'idx_financial_transactions_payer_id', desc: 'Payer foreign key index' },
      { name: 'idx_financial_transactions_tenant_id', desc: 'Tenant index' },

      // Task users
      { name: 'idx_task_users_task_id', desc: 'Task foreign key index' },
      { name: 'idx_task_users_user_id', desc: 'User foreign key index' },

      // Tasks
      { name: 'idx_tasks_position', desc: 'Position index for ordering' },
      { name: 'idx_tasks_assignee_id', desc: 'Assignee foreign key index' },
      { name: 'idx_tasks_column_id', desc: 'Column foreign key index' },
      { name: 'idx_tasks_project_id', desc: 'Project foreign key index' },
      { name: 'idx_tasks_tenant_id', desc: 'Tenant index' },

      // Executions
      { name: 'idx_executions_employee_due_date', desc: 'Employee + due date composite index for payroll queries' },
      { name: 'idx_executions_due_date', desc: 'Due date index for date range queries' },
      { name: 'idx_executions_status', desc: 'Status index' },
      { name: 'idx_executions_project_item_id', desc: 'Project item foreign key index' },
      { name: 'idx_executions_project_id', desc: 'Project foreign key index' },
      { name: 'idx_executions_employee_id', desc: 'Employee foreign key index' },
      { name: 'idx_executions_tenant_id', desc: 'Tenant index' },

      // Items
      { name: 'idx_items_category', desc: 'Category index for filtering' },
      { name: 'idx_items_tenant_id', desc: 'Tenant index' },

      // Project items
      { name: 'idx_project_items_project_num', desc: 'Position index for ordering' },
      { name: 'idx_project_items_project_id', desc: 'Project foreign key index' },

      // Projects
      { name: 'idx_projects_due_date', desc: 'Due date index for scheduling' },
      { name: 'idx_projects_location_id', desc: 'Location foreign key index' },
      { name: 'idx_projects_tender_id', desc: 'Tender foreign key index' },
      { name: 'idx_projects_contractor_id', desc: 'Contractor foreign key index' },
      { name: 'idx_projects_customer_id', desc: 'Customer foreign key index' },
      { name: 'idx_projects_tenant_status', desc: 'Tenant + status composite index' },
      { name: 'idx_projects_tenant_id', desc: 'Tenant index' },

      // Tender items
      { name: 'idx_tender_items_tender_num', desc: 'Position index for ordering' },
      { name: 'idx_tender_items_tender_id', desc: 'Tender foreign key index' },

      // Tenders
      { name: 'idx_tenders_updated_on', desc: 'Updated date index for sorting' },
      { name: 'idx_tenders_number', desc: 'Tender number index for uniqueness' },
      { name: 'idx_tenders_contact_id', desc: 'Contact foreign key index' },
      { name: 'idx_tenders_location_id', desc: 'Location foreign key index' },
      { name: 'idx_tenders_contractor_id', desc: 'Contractor foreign key index' },
      { name: 'idx_tenders_customer_id', desc: 'Customer foreign key index' },
      { name: 'idx_tenders_tenant_status', desc: 'Tenant + status composite index' },
      { name: 'idx_tenders_tenant_id', desc: 'Tenant index' },

      // Locations
      { name: 'idx_locations_tenant_id', desc: 'Tenant index' },

      // Contacts
      { name: 'idx_contacts_email', desc: 'Email index for lookups' },
      { name: 'idx_contacts_user_id', desc: 'User foreign key index' },
      { name: 'idx_contacts_tenant_id', desc: 'Tenant index' },

      // Companies
      { name: 'idx_companies_tax_number', desc: 'Tax number index for uniqueness checks' },
      { name: 'idx_companies_tenant_status', desc: 'Tenant + status composite index' },
      { name: 'idx_companies_tenant_type', desc: 'Tenant + type composite index' },

      // Users
      { name: 'idx_users_created_on', desc: 'Created date index for sorting' },
      { name: 'idx_users_role_id', desc: 'Role foreign key index' },
      { name: 'idx_users_email', desc: 'Email index for authentication' },
      { name: 'idx_users_tenant_status', desc: 'Tenant + status composite index' },
      { name: 'idx_users_tenant_entity', desc: 'Tenant + entity composite index' }
    ];

    for (const { name, desc } of indexes) {
      await dropIndex(name, desc);
    }

    console.log('Performance indexes removed successfully!');
  }
};