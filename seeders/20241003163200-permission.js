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
      name: 'Execution:Get',
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
    }, {
      name: 'OrderForm:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'OrderForm:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'OrderForm:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'OrderForm:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'OrderForm:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'OrderForm:Approve',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'CompletionCertificate:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'CompletionCertificate:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'CompletionCertificate:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'CompletionCertificate:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'CompletionCertificate:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'CompletionCertificate:Approve',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Invoice:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Invoice:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Invoice:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Invoice:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Invoice:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Invoice:Approve',
      created_on: new Date(),
      updated_on: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", null, {});
  }
};