"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("task_columns", "finished", {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("task_columns", "finished")
  }
};