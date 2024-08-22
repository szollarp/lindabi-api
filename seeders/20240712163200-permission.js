"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("permissions", [{
      name: 'Employee:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Employee:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Employee:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Employee:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Employee:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", null, {});
  }
};