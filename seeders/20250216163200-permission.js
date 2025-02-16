"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("permissions", [{
      name: 'PettyCash:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'PettyCash:Create',
      created_on: new Date(),
      updated_on: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", null, {});
  }
};