"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("permissions", [{
      name: 'Project:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", null, {});
  }
};