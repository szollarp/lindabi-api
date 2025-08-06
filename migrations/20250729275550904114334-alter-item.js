'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("items", "manufacturer", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("items", "net_amount", {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: false,
      }),
      queryInterface.addColumn("items", "vat_key", {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      }),
      queryInterface.removeColumn("items", "price"),
    ])
  },

  down: async (queryInterface, Sequelize) => {
  }
};