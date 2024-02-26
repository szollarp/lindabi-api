"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      return await Promise.all([
        queryInterface.changeColumn("companies", "email", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
        queryInterface.changeColumn("companies", "tax_number", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
        queryInterface.changeColumn("companies", "registration_number", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
        queryInterface.changeColumn("companies", "bank_account", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
        queryInterface.changeColumn("companies", "prefix", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
        queryInterface.changeColumn("companies", "default", {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: true
        }, { transaction: t }),
        queryInterface.addColumn("companies", "notes", {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        }, { transaction: t })
      ])
    });
  },
  down: (queryInterface) => {
    return;
  }
};