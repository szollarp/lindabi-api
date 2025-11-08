"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("projects", "end_date", {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("projects", "end_date")
  }
};

