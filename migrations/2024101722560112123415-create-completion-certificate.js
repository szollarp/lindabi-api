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
      approved: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false
      },
      approved_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
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
