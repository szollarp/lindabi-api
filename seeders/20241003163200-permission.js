"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("permissions", [{
      name: 'StatusReport:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'StatusReport:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'StatusReport:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'StatusReport:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Execution:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Execution:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Execution:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Execution:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Execution:Approve',
      created_on: new Date(),
      updated_on: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", null, {});
  }
};