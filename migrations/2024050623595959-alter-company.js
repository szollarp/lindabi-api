"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("companies", "offer_num", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("companies", "offer_num")
  }
};