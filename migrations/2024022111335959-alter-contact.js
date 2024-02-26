"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("contacts", "status", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("contacts", "status")
  }
};