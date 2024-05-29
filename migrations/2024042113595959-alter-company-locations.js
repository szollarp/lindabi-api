"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("company_locations", {
      company_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      location_id: {
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
    return queryInterface.dropTable("company_locations");
  }
};