"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("tasks", "start_date", {
      type: Sequelize.DATE,
      allowNull: true
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("tasks", "start_date")
  }
};