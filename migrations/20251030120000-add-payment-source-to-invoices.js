"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("invoices", "payment_source", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: "company",
      comment: "Source of payment: personal or company"
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("invoices", "payment_source")
  }
};

