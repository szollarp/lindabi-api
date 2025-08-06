'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('item_movements', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      type: {
        type: Sequelize.DataTypes.ENUM('issue', 'return', 'transfer'),
        allowNull: false,
      },
      item_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      source: {
        type: Sequelize.DataTypes.ENUM('warehouse', 'project'),
        allowNull: false,
      },
      source_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      target: {
        type: Sequelize.DataTypes.ENUM('warehouse', 'project'),
        allowNull: true,
      },
      target_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      tenant_id: {
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

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('item_movements');
  }
};