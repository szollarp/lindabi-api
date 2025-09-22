'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Enable the pg_trgm extension for fuzzy text search
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
  },

  down: async (queryInterface, Sequelize) => {
    // Note: We don't drop the extension as it might be used by other tables
    // await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS pg_trgm;');
  }
};
