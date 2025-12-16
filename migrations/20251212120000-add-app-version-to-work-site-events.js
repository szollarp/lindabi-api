'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add app_version column to work_site_events table
    await queryInterface.addColumn('work_site_events', 'app_version', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove app_version column
    await queryInterface.removeColumn('work_site_events', 'app_version');
  }
};
