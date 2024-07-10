"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("locations", "tax_number", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("locations", "tax_number")
  }
};