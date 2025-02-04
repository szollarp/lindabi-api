"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "in_schedule", {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("users", "in_schedule")
  }
};