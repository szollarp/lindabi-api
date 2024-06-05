"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("documents", "name", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("documents", "name")
  }
};