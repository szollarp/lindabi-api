"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("documents", "properties", {
      type: Sequelize.DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("documents", "properties")
  }
};