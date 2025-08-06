'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("project_items", "material_net_amount", {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("project_items", "fee_net_amount", {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.removeColumn("project_items", "material_net_amount"),
      queryInterface.removeColumn("project_items", "fee_net_amount")
    ]);
  }
};