"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("task_columns", "fixed", {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("task_columns", "fixed")
  }
};