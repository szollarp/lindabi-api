"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("documents", "approved", {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("documents", "approved")
  }
};