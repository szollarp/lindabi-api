"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("invoices", "type", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: "employee"
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("invoices", "type")
  }
};