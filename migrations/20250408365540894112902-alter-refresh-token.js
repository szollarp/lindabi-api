"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("refresh_tokens", "device_id", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("refresh_tokens", "device_id")
  }
};