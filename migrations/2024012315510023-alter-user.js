"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      return await Promise.all([
        queryInterface.addColumn("users", "country", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
        queryInterface.addColumn("users", "region", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
        queryInterface.addColumn("users", "city", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
        queryInterface.addColumn("users", "zip_code", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
        queryInterface.addColumn("users", "address", {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        }, { transaction: t }),
      ]);
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      return await Promise.all([
        queryInterface.removeColumn("users", "country", { transaction: t }),
        queryInterface.removeColumn("users", "region", { transaction: t }),
        queryInterface.removeColumn("users", "city", { transaction: t }),
        queryInterface.removeColumn("users", "zipCode", { transaction: t }),
        queryInterface.removeColumn("users", "address", { transaction: t })
      ]);
    });
  }
};