"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("companies", "email", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("companies", "email")
  }
};