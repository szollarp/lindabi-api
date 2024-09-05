"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("project_supervisors", {
      project_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      contact_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
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
    return queryInterface.dropTable("project_supervisors");
  }
};