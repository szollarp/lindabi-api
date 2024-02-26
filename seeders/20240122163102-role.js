"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("roles", [{
      name: "Administrator",
      created_on: new Date()
    }, {
      name: "Manager",
      created_on: new Date()
    }, {
      name: "Leader",
      created_on: new Date()
    }, {
      name: "Employee",
      created_on: new Date()
    }, {
      name: "Casual Worker",
      created_on: new Date()
    }, {
      name: "Utility Worker",
      created_on: new Date()
    }, {
      name: "Lawyer",
      created_on: new Date()
    }, {
      name: "Accountant",
      created_on: new Date()
    }, {
      name: "Customer",
      created_on: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("roles", null, {});
  }
};