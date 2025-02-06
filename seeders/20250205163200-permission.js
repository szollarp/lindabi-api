"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("permissions", [{
      name: 'Schedule:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Schedule:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Schedule:ViewOutOfLimit',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Schedule:AddEmployee',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Schedule:AddHoliday',
      created_on: new Date(),
      updated_on: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", null, {});
  }
};