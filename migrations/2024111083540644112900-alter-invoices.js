"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("invoices", "status", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: "crated"
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("invoices", "status")
  }
};