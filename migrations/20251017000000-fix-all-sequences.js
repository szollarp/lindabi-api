'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // List of all tables with auto-incrementing id columns
    const tables = [
      'users',
      'roles',
      'permissions',
      'role_permissions',
      'account_verify_tokens',
      'forgotten_password_tokens',
      'refresh_tokens',
      'two_factor_sessions',
      'two_factor_authentications',
      'tenants',
      'subscriptions',
      'contacts',
      'companies',
      'locations',
      'documents',
      'tenders',
      'tender_items',
      'journeys',
      'salaries',
      'projects',
      'project_items',
      'project_contacts',
      'project_supervisors',
      'milestones',
      'project_comments',
      'status_reports',
      'executions',
      'completion_certificates',
      'order_forms',
      'invoices',
      'financial_settings',
      'employee_schedules',
      'financial_transactions',
      'tasks',
      'task_comments',
      'task_columns',
      'task_users',
      'work_types',
      'item_movements',
      'items',
      'warehouses',
      'notifications',
      'analytics',
      'tender_items_searches',
      'tender_number_counters'
    ];

    console.log('Starting sequence fix for all tables...');

    for (const table of tables) {
      try {
        // Check if table exists
        const tableExists = await queryInterface.sequelize.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
          );`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        if (!tableExists[0].exists) {
          console.log(`Table ${table} does not exist, skipping...`);
          continue;
        }

        // Check if id column exists
        const columnExists = await queryInterface.sequelize.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
            AND column_name = 'id'
          );`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        if (!columnExists[0].exists) {
          console.log(`Table ${table} does not have id column, skipping...`);
          continue;
        }

        // Get current max id
        const maxIdResult = await queryInterface.sequelize.query(
          `SELECT MAX(id) as max_id FROM ${table};`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        const maxId = maxIdResult[0].max_id;
        const sequenceName = `${table}_id_seq`;

        // Check if sequence exists
        const sequenceExists = await queryInterface.sequelize.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.sequences 
            WHERE sequence_schema = 'public' 
            AND sequence_name = '${sequenceName}'
          );`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        if (!sequenceExists[0].exists) {
          console.log(`Sequence ${sequenceName} does not exist, skipping...`);
          continue;
        }

        // Get current sequence value
        const lastValueResult = await queryInterface.sequelize.query(
          `SELECT last_value FROM ${sequenceName};`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        const lastValue = lastValueResult[0].last_value;
        const newValue = (maxId || 0) + 1;

        console.log(`Table: ${table}`);
        console.log(`  Current MAX(id): ${maxId}`);
        console.log(`  Current sequence value: ${lastValue}`);
        console.log(`  Setting sequence to: ${newValue}`);

        // Fix the sequence
        await queryInterface.sequelize.query(
          `SELECT setval('${sequenceName}', ${newValue}, false);`
        );

        console.log(`  ✓ Sequence ${sequenceName} updated successfully`);
      } catch (error) {
        console.error(`Error processing table ${table}:`, error.message);
        // Continue with next table even if one fails
      }
    }

    console.log('Sequence fix completed!');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration cannot be reversed as we don't know what the previous sequence values were
    console.log('This migration cannot be reversed. Sequence values were updated based on current data.');
  }
};

