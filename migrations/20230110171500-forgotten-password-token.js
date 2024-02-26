'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('forgotten_password_tokens', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      token: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      expired_on: {
        type: Sequelize.DataTypes.DATE
      },
      created_on: {
        type: Sequelize.DataTypes.DATE
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      deleted_on: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('forgotten_password_tokens');
  }
};
