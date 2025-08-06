'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("items", "deleted_on", {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.removeColumn("items", "deleted_on")
    ]);
  }
};