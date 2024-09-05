"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("tenders", "short_name", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("tenders", "short_name")
  }
};