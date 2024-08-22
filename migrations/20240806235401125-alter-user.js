"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "properties", {
      type: Sequelize.DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("users", "properties")
  }
};