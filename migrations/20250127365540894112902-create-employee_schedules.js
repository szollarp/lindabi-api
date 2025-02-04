'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('employee_schedules', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
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
      created_pn: {
        type: Sequelize.DataTypes.DATE
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      },
      tenant_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('employee_schedules');
  }
};
