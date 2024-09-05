"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("projects", "reports", {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("projects", "reports")
  }
};