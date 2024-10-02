'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('status_reports', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      available_to_client: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: "in progress"
      },
      due_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      notes: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      project_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      created_on: {
        type: Sequelize.DataTypes.DATE
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('status_reports');
  }
};
