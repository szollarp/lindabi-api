'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('projects', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: "in progress"
      },
      type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      number: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      vat_key: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      start_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      notes: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      inquiry: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      survey: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      location_description: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      tool_requirements: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      other_comment: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      customer_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      contractor_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      location_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      tenant_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      tender_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      net_amount: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      vat_amount: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      supervisor_bonus: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      in_schedule: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      schedule_color: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      short_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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
    return queryInterface.dropTable('projects');
  }
};
