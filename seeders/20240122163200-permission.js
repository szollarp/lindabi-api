"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("permissions", [{
      name: 'System:*',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Tenant:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Tenant:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Tenant:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Tenant:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Tenant:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'User:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'User:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'User:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'User:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'User:UpdatePassword',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'User:UpdateRole',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'User:SendResetPassword',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'User:SendAccountVerification',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'User:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Permission:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Permission:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contractor:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contractor:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contractor:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contractor:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contractor:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contact:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contact:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contact:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contact:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Contact:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Customer:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Customer:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Customer:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Customer:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Customer:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Location:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Location:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Location:Get',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Location:Update',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Location:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", null, {});
  }
};