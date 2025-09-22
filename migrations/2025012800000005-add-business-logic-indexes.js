'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Adding business logic indexes...');

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
    // JOURNEY/ACTIVITY LOG INDEXES
    // ===========================================

    // Journey entries by owner and type
    await createIndex('journeys', ['owner_id', 'owner_type'], {
      name: 'idx_journeys_owner_id_type',
      concurrently: true
    }, 'Journey entries by owner and type');

    // Journey entries by date for cleanup
    await createIndex('journeys', ['created_on'], {
      name: 'idx_journeys_created_on',
      concurrently: true
    }, 'Journey entries by date for cleanup');

    // ===========================================
    // DOCUMENT MANAGEMENT INDEXES
    // ===========================================

    // Documents by owner and type
    await createIndex('documents', ['owner_id', 'owner_type', 'type'], {
      name: 'idx_documents_owner_id_type_doc_type',
      concurrently: true
    }, 'Documents by owner and type');

    // Documents by approval status
    await createIndex('documents', ['approved'], {
      name: 'idx_documents_approved',
      concurrently: true
    }, 'Documents by approval status');

    // ===========================================
    // MILESTONE AND PROJECT RELATIONSHIPS
    // ===========================================

    // Milestones by project
    await createIndex('milestones', ['project_id'], {
      name: 'idx_milestones_project_id',
      concurrently: true
    }, 'Milestones by project');

    // Milestones by due date
    await createIndex('milestones', ['due_date'], {
      name: 'idx_milestones_due_date',
      concurrently: true
    }, 'Milestones by due date');

    // ===========================================
    // ORDER FORMS AND COMPLETION CERTIFICATES
    // ===========================================

    // Order forms by employee
    await createIndex('order_forms', ['employee_id'], {
      name: 'idx_order_forms_employee_id',
      concurrently: true
    }, 'Order forms by employee');

    // Order forms by project
    await createIndex('order_forms', ['project_id'], {
      name: 'idx_order_forms_project_id',
      concurrently: true
    }, 'Order forms by project');

    // Order forms by manager
    await createIndex('order_forms', ['manager_id'], {
      name: 'idx_order_forms_manager_id',
      concurrently: true
    }, 'Order forms by manager');

    // Order forms by status
    await createIndex('order_forms', ['status'], {
      name: 'idx_order_forms_status',
      concurrently: true
    }, 'Order forms by status');

    // Completion certificates by employee
    await createIndex('completion_certificates', ['employee_id'], {
      name: 'idx_completion_certificates_employee_id',
      concurrently: true
    }, 'Completion certificates by employee');

    // Completion certificates by project
    await createIndex('completion_certificates', ['project_id'], {
      name: 'idx_completion_certificates_project_id',
      concurrently: true
    }, 'Completion certificates by project');

    // ===========================================
    // EMPLOYEE SCHEDULE INDEXES
    // ===========================================

    // Employee schedules by employee
    await createIndex('employee_schedules', ['employee_id'], {
      name: 'idx_employee_schedules_employee_id',
      concurrently: true
    }, 'Employee schedules by employee');

    // Employee schedules by date range
    await createIndex('employee_schedules', ['start_date', 'end_date'], {
      name: 'idx_employee_schedules_date_range',
      concurrently: true
    }, 'Employee schedules by date range');

    // ===========================================
    // TASK MANAGEMENT INDEXES
    // ===========================================

    // Task columns by tenant
    await createIndex('task_columns', ['tenant_id'], {
      name: 'idx_task_columns_tenant_id',
      concurrently: true
    }, 'Task columns by tenant');

    // Task columns by finished status
    await createIndex('task_columns', ['finished'], {
      name: 'idx_task_columns_finished',
      concurrently: true
    }, 'Task columns by finished status');

    // Task comments by task
    await createIndex('task_comments', ['task_id'], {
      name: 'idx_task_comments_task_id',
      concurrently: true
    }, 'Task comments by task');

    // Task comments by creator
    await createIndex('task_comments', ['created_by'], {
      name: 'idx_task_comments_creator_id',
      concurrently: true
    }, 'Task comments by creator');

    // ===========================================
    // WAREHOUSE AND STOCK MANAGEMENT
    // ===========================================

    // Stock by warehouse
    await createIndex('item_movements', ['source_id', 'item_id'], {
      name: 'idx_stocks_target_item',
      concurrently: true
    }, 'Stock by target');

    // Stock by warehouse and item (composite)
    await createIndex('item_movements', ['target_id', 'item_id'], {
      name: 'idx_stocks_source_item',
      concurrently: true
    }, 'Stock by source and item');

    // ===========================================
    // FINANCIAL SETTINGS INDEXES
    // ===========================================

    // Financial settings by tenant
    await createIndex('financial_settings', ['tenant_id'], {
      name: 'idx_financial_settings_tenant_id',
      concurrently: true
    }, 'Financial settings by tenant');

    // Financial settings by date range
    await createIndex('financial_settings', ['start_date', 'end_date'], {
      name: 'idx_financial_settings_date_range',
      concurrently: true
    }, 'Financial settings by date range');

    // ===========================================
    // TENDER NUMBER COUNTERS
    // ===========================================

    // Tender number counters by tenant and contractor
    await createIndex('tender_number_counters', ['tenant_id', 'contractor_id'], {
      name: 'idx_tender_number_counters_tenant_contractor',
      concurrently: true
    }, 'Tender number counters by tenant and contractor');

    // Tender number counters by year
    await createIndex('tender_number_counters', ['year'], {
      name: 'idx_tender_number_counters_year',
      concurrently: true
    }, 'Tender number counters by year');

    // ===========================================
    // WORK TYPES INDEXES
    // ===========================================

    // Work types by tenant
    await createIndex('work_types', ['tenant_id'], {
      name: 'idx_work_types_tenant_id',
      concurrently: true
    }, 'Work types by tenant');

    // ===========================================
    // PROJECT CONTACTS AND SUPERVISORS (JUNCTION TABLES)
    // ===========================================

    // Project contacts by project
    await createIndex('project_contacts', ['project_id'], {
      name: 'idx_project_contacts_project_id',
      concurrently: true
    }, 'Project contacts by project');

    // Project contacts by contact
    await createIndex('project_contacts', ['contact_id'], {
      name: 'idx_project_contacts_contact_id',
      concurrently: true
    }, 'Project contacts by contact');

    // Project supervisors by project
    await createIndex('project_supervisors', ['project_id'], {
      name: 'idx_project_supervisors_project_id',
      concurrently: true
    }, 'Project supervisors by project');

    // Project supervisors by contact
    await createIndex('project_supervisors', ['contact_id'], {
      name: 'idx_project_supervisors_contact_id',
      concurrently: true
    }, 'Project supervisors by contact');

    // ===========================================
    // COMPANY LOCATIONS AND CONTACTS (JUNCTION TABLES)
    // ===========================================

    // Company locations by company
    await createIndex('company_locations', ['company_id'], {
      name: 'idx_company_locations_company_id',
      concurrently: true
    }, 'Company locations by company');

    // Company locations by location
    await createIndex('company_locations', ['location_id'], {
      name: 'idx_company_locations_location_id',
      concurrently: true
    }, 'Company locations by location');

    // Company contacts by company
    await createIndex('company_contacts', ['company_id'], {
      name: 'idx_company_contacts_company_id',
      concurrently: true
    }, 'Company contacts by company');

    // Company contacts by contact
    await createIndex('company_contacts', ['contact_id'], {
      name: 'idx_company_contacts_contact_id',
      concurrently: true
    }, 'Company contacts by contact');

    // ===========================================
    // ROLE AND PERMISSION INDEXES
    // ===========================================

    // Role permissions by role
    await createIndex('role_permissions', ['role_id'], {
      name: 'idx_role_permissions_role_id',
      concurrently: true
    }, 'Role permissions by role');

    // Role permissions by permission
    await createIndex('role_permissions', ['permission_id'], {
      name: 'idx_role_permissions_permission_id',
      concurrently: true
    }, 'Role permissions by permission');

    // ===========================================
    // AUTHENTICATION TOKEN INDEXES
    // ===========================================

    // Refresh tokens by user
    await createIndex('refresh_tokens', ['user_id'], {
      name: 'idx_refresh_tokens_user_id',
      concurrently: true
    }, 'Refresh tokens by user');

    // Refresh tokens by token
    await createIndex('refresh_tokens', ['token'], {
      name: 'idx_refresh_tokens_token',
      concurrently: true
    }, 'Refresh tokens by token');

    // Account verify tokens by user
    await createIndex('account_verify_tokens', ['user_id'], {
      name: 'idx_account_verify_tokens_user_id',
      concurrently: true
    }, 'Account verify tokens by user');

    // Forgotten password tokens by user
    await createIndex('forgotten_password_tokens', ['user_id'], {
      name: 'idx_forgotten_password_tokens_user_id',
      concurrently: true
    }, 'Forgotten password tokens by user');

    // ===========================================
    // TWO-FACTOR AUTHENTICATION INDEXES
    // ===========================================

    // Two factor sessions by user
    await createIndex('two_factor_sessions', ['user_id'], {
      name: 'idx_two_factor_sessions_user_id',
      concurrently: true
    }, 'Two factor sessions by user');

    // Two factor authentication by user
    await createIndex('two_factor_authentications', ['user_id'], {
      name: 'idx_two_factor_authentications_user_id',
      concurrently: true
    }, 'Two factor authentication by user');

    // ===========================================
    // SUBSCRIPTION INDEXES
    // ===========================================

    // Subscriptions by tenant
    await createIndex('subscriptions', ['tenant_id'], {
      name: 'idx_subscriptions_tenant_id',
      concurrently: true
    }, 'Subscriptions by tenant');

    // Subscriptions by date range
    await createIndex('subscriptions', ['date_start', 'date_end'], {
      name: 'idx_subscriptions_date_range',
      concurrently: true
    }, 'Subscriptions by date range');

    console.log('Business logic indexes added successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Removing business logic indexes...');

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
      // Subscriptions
      { name: 'idx_subscriptions_date_range', desc: 'Subscriptions by date range' },
      { name: 'idx_subscriptions_tenant_id', desc: 'Subscriptions by tenant' },

      // Two-factor authentication
      { name: 'idx_two_factor_authentications_user_id', desc: 'Two factor authentication by user' },
      { name: 'idx_two_factor_sessions_user_id', desc: 'Two factor sessions by user' },

      // Authentication tokens
      { name: 'idx_forgotten_password_tokens_user_id', desc: 'Forgotten password tokens by user' },
      { name: 'idx_account_verify_tokens_user_id', desc: 'Account verify tokens by user' },
      { name: 'idx_refresh_tokens_token', desc: 'Refresh tokens by token' },
      { name: 'idx_refresh_tokens_user_id', desc: 'Refresh tokens by user' },

      // Role and permissions
      { name: 'idx_role_permissions_permission_id', desc: 'Role permissions by permission' },
      { name: 'idx_role_permissions_role_id', desc: 'Role permissions by role' },

      // Company relationships
      { name: 'idx_company_contacts_contact_id', desc: 'Company contacts by contact' },
      { name: 'idx_company_contacts_company_id', desc: 'Company contacts by company' },
      { name: 'idx_company_locations_location_id', desc: 'Company locations by location' },
      { name: 'idx_company_locations_company_id', desc: 'Company locations by company' },

      // Project relationships
      { name: 'idx_project_supervisors_contact_id', desc: 'Project supervisors by contact' },
      { name: 'idx_project_supervisors_project_id', desc: 'Project supervisors by project' },
      { name: 'idx_project_contacts_contact_id', desc: 'Project contacts by contact' },
      { name: 'idx_project_contacts_project_id', desc: 'Project contacts by project' },

      // Work types
      { name: 'idx_work_types_tenant_id', desc: 'Work types by tenant' },

      // Tender number counters
      { name: 'idx_tender_number_counters_year', desc: 'Tender number counters by year' },
      { name: 'idx_tender_number_counters_tenant_contractor', desc: 'Tender number counters by tenant and contractor' },

      // Financial settings
      { name: 'idx_financial_settings_date_range', desc: 'Financial settings by date range' },
      { name: 'idx_financial_settings_tenant_id', desc: 'Financial settings by tenant' },

      // Stock management
      { name: 'idx_stocks_target_item', desc: 'Stock by target and item' },
      { name: 'idx_stocks_source_item', desc: 'Stock by source and item' },

      // Task management
      { name: 'idx_task_comments_creator_id', desc: 'Task comments by creator' },
      { name: 'idx_task_comments_task_id', desc: 'Task comments by task' },
      { name: 'idx_task_columns_finished', desc: 'Task columns by finished status' },
      { name: 'idx_task_columns_tenant_id', desc: 'Task columns by tenant' },

      // Employee schedules
      { name: 'idx_employee_schedules_date_range', desc: 'Employee schedules by date range' },
      { name: 'idx_employee_schedules_employee_id', desc: 'Employee schedules by employee' },

      // Order forms and completion certificates
      { name: 'idx_completion_certificates_project_id', desc: 'Completion certificates by project' },
      { name: 'idx_completion_certificates_employee_id', desc: 'Completion certificates by employee' },
      { name: 'idx_order_forms_status', desc: 'Order forms by status' },
      { name: 'idx_order_forms_manager_id', desc: 'Order forms by manager' },
      { name: 'idx_order_forms_project_id', desc: 'Order forms by project' },
      { name: 'idx_order_forms_employee_id', desc: 'Order forms by employee' },

      // Milestones
      { name: 'idx_milestones_due_date', desc: 'Milestones by due date' },
      { name: 'idx_milestones_project_id', desc: 'Milestones by project' },

      // Documents
      { name: 'idx_documents_approved', desc: 'Documents by approval status' },
      { name: 'idx_documents_owner_id_type_doc_type', desc: 'Documents by owner and type' },

      // Journey/Activity logs
      { name: 'idx_journeys_created_on', desc: 'Journey entries by date for cleanup' },
      { name: 'idx_journeys_owner_id_type', desc: 'Journey entries by owner and type' }
    ];

    for (const { name, desc } of indexes) {
      await dropIndex(name, desc);
    }

    console.log('Business logic indexes removed successfully!');
  }
};