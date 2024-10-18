'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('order_forms', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      number: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: "created"
      },
      amount: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: false
      },
      issue_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      site_handover_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      deadline_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      financial_schedule: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
      other_notes: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
      employee_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      manager_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      project_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      created_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('order_forms');
  }
};
