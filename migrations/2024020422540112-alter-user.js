"use strict";

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.removeColumn("users", "two_factor_secret")
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.addColumn("users", "two_factor_secret", {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
        defaultValue: null
      });
    });
  }
};