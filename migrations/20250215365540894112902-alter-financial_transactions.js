"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("financial_transactions", "invoice_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("financial_transactions", "invoice_id")
  }
};