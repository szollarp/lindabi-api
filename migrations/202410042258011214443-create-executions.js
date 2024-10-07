'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('executions', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      settlement: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: "daily"
      },
      due_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      quantity: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      unit: {
        type: Sequelize.DataTypes.STRING,
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
      employee_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: "pending"
      },
      approved_by: {
        type: Sequelize.Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      created_by: {
        type: Sequelize.Sequelize.DataTypes.INTEGER
      },
      updated_by: {
        type: Sequelize.Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      approved_on: {
        type: Sequelize.Sequelize.DataTypes.DATE
      },
      created_on: {
        type: Sequelize.Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      },
      updated_on: {
        type: Sequelize.Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('executions');
  }
};
