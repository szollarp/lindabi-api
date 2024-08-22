"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("contacts", "user_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("contacts", "user_id")
  }
};