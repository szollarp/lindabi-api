"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("financial_settings", "type", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("financial_settings", "type")
  }
};