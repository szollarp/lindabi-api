"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("role_permissions", {
      role_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      permission_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      created_on: {
        type: Sequelize.DataTypes.DATE
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("role_permissions");
  }
};