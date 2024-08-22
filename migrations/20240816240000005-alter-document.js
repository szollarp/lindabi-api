"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("documents", "company_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("documents", "company_id")
  }
};