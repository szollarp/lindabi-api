"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("locations", "latitude", {
      type: Sequelize.DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn("locations", "longitude", {
      type: Sequelize.DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("locations", "longitude");
    await queryInterface.removeColumn("locations", "latitude");
  }
};
