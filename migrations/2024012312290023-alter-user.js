"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "phone_number", {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.removeColumn("users", "phone_number", { transaction: t })
    });
  }
};