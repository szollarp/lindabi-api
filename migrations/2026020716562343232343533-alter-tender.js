"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("tenders", "sent_on", {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("tenders", "sent_on")
  }
};