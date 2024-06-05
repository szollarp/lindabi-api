'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('journeys', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      activity: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      property: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      existed: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
      updated: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      username: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      owner_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      owner_type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER
      },
      created_on: {
        type: Sequelize.DataTypes.DATE
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('journeys');
  }
};
