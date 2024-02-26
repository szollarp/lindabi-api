"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("two_factor_sessions", "user_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.removeColumn("two_factor_sessions", "user_id", { transaction: t })
    });
  }
};