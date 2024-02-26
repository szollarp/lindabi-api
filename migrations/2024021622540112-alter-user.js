"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "tenant_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      default: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("users", "tenant_id")
  }
};