"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("executions", "type");
  },
  down: (queryInterface) => { }
};