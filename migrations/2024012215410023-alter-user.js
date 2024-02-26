"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "role_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.removeColumn("users", "role_id", { transaction: t })
    });
  }
};