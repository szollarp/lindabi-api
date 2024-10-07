"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("executions", "distance", {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("executions", "workday_start", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("executions", "workday_end", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("executions", "break_start", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("executions", "break_end", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
    ])
  },
  down: async (queryInterface) => {
    return await Promise.all([
      queryInterface.removeColumn("executions", "distance"),
      queryInterface.removeColumn("executions", "workday_start"),
      queryInterface.removeColumn("executions", "workday_end"),
      queryInterface.removeColumn("executions", "break_start"),
      queryInterface.removeColumn("executions", "break_end")
    ]);
  }
};