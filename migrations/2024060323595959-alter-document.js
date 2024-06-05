"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("documents", "size", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("documents", "size")
  }
};