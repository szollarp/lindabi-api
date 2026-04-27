"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("item_movements", "employee_id", {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      })
    ])
  },
  down: async (queryInterface) => {
    return await Promise.all([
      queryInterface.removeColumn("item_movements", "employee_id")
    ]);
  }
};