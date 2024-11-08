"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("executions", "tenant_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("executions", "tenant_id")
  }
};