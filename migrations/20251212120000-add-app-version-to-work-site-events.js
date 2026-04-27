'use strict';

// NOTE: 'work_site_events' table is never created by any migration. The actual
// table is 'tracking_events', which already includes app_version (see
// 2025072823595959-create-tracking-events.js). Treat this migration as a no-op
// when the table is absent so the migration record can be persisted.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT to_regclass('public.work_site_events') AS reg`
    );
    if (!rows[0] || rows[0].reg === null) {
      console.log("⚠ Skipping add_app_version_to_work_site_events - table 'work_site_events' does not exist");
      return;
    }
    await queryInterface.addColumn('work_site_events', 'app_version', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT to_regclass('public.work_site_events') AS reg`
    );
    if (!rows[0] || rows[0].reg === null) {
      return;
    }
    await queryInterface.removeColumn('work_site_events', 'app_version');
  }
};
