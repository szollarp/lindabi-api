"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("executions", "project_item_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("executions", "project_item_id")
  }
};