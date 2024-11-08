"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("order_forms", "tenant_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("order_forms", "tenant_id")
  }
};