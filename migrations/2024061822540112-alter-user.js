"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "notifications", {
      type: Sequelize.DataTypes.JSONB,
      allowNull: true,
      default: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("users", "notifications")
  }
};