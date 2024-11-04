"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("companies", "ceo", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("companies", "ceo")
  }
};