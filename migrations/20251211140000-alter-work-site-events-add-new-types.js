'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if enum values already exist before adding them
    // PostgreSQL doesn't support IF NOT EXISTS for ALTER TYPE ADD VALUE
    // So we need to check manually and add only if they don't exist

    const checkAndAddValue = async (value) => {
      const [results] = await queryInterface.sequelize.query(`
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = '${value}' 
        AND enumtypid = (
          SELECT oid FROM pg_type WHERE typname = 'enum_work_site_events_event_type'
        )
      `);

      if (results.length === 0) {
        await queryInterface.sequelize.query(`
          ALTER TYPE "enum_work_site_events_event_type" 
          ADD VALUE '${value}';
        `);
      }
    };

    await checkAndAddValue('gps_signal_lost');
    await checkAndAddValue('gps_signal_recovered');
    await checkAndAddValue('app_background');
    await checkAndAddValue('app_foreground');
    await checkAndAddValue('app_init');
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing ENUM values easily
    // This would require recreating the ENUM type, which is complex
    // For now, we'll leave the new values in place
    // If needed, this can be handled manually or with a more complex migration
  }
};
