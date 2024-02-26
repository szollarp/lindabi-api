'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        default: "ACTIVE"
      },
      password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      salt: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      enable_two_factor: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      two_factor_secret: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
        defaultValue: null
      },
      created_on: {
        type: Sequelize.DataTypes.DATE
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      deleted_on: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true,
      },
      deleted_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
