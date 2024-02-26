"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "last_logged_in", {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.removeColumn("users", "last_logged_in", { transaction: t })
    });
  }
};