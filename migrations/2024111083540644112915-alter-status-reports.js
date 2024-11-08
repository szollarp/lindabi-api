"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("status_reports", "tenant_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("status_reports", "tenant_id")
  }
};