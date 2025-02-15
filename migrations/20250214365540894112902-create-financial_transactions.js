'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('financial_transactions', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      description: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      recipient_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      recipient_type: {
        type: Sequelize.DataTypes.ENUM("employee", "cash desk"),
        allowNull: false
      },
      payer_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      payer_type: {
        type: Sequelize.DataTypes.ENUM("employee", "cash desk"),
        allowNull: false
      },
      contractor_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      tenant_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
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
        defaultValue: null,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('financial_transactions');
  }
};
