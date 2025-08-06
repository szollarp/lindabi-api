'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('warehouses', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      country: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      region: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      city: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      zip_code: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
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
    return queryInterface.dropTable('warehouses');
  }
};