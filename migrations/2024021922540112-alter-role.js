"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("roles", "tenant_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      default: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("roles", "tenant_id")
  }
};