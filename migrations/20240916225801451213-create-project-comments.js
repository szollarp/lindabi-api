'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('project_comments', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      project_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      contact_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      notes: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      checked: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_by: {
        type: Sequelize.Sequelize.DataTypes.INTEGER
      },
      updated_by: {
        type: Sequelize.Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      created_on: {
        type: Sequelize.Sequelize.DataTypes.DATE
      },
      updated_on: {
        type: Sequelize.Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('project_comments');
  }
};
