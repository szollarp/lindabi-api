'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('tenders', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: "inquiry"
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
      fee: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null
      },
      returned: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
      },
      vat_key: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      currency: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      surcharge: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null
      },
      discount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null
      },
      valid_to: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      due_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      open_date: {
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
      contact_id: {
        type: Sequelize.DataTypes.INTEGER,
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tenders');
  }
};
