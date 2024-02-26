"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("contacts", "notes", {
      type: Sequelize.DataTypes.TEXT,
      allowNull: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.changeColumn("contacts", "notes", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    });
  }
};