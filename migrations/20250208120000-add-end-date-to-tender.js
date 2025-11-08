"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("tenders", "end_date", {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("tenders", "end_date")
  }
};

