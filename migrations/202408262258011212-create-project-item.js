'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('project_items', {
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
      quantity: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      unit: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      num: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: "daily"
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: "open"
      },
      net_amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null
      },
      notes: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('project_items');
  }
};
