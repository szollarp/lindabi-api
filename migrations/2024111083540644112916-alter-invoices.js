"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("invoices", "tenant_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("invoices", "tenant_id")
  }
};