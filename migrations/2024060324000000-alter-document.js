"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("documents", "preview", {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("documents", "preview")
  }
};