'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('completion_certificates', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      deviation: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
      },
      amount: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: false
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'draft'
      },
      created_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      approved_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      employee_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      order_form_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      project_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('completion_certificates');
  }
};
