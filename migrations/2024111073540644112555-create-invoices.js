'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('invoices', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      invoice_number: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      payment_type: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: "bank",
        allowNull: false
      },
      note: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      completion_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      issue_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      payment_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      net_amount: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: false
      },
      vat_amount: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: false
      },
      vat_key: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      title: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      as_email: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      patty_cash: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      in_salary: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      project_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      milestone_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      contractor_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      employee_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      supplier_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      document_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      created_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
      approved_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      payed_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('invoices');
  }
};
