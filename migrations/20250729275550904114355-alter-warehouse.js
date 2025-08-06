'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("warehouses", "deleted_on", {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.removeColumn("warehouses", "deleted_on")
    ]);
  }
};