'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('financial_settings', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      start_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      amount: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER
      },
      created_on: {
        type: Sequelize.DataTypes.DATE
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      tenant_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('financial_settings');
  }
};
