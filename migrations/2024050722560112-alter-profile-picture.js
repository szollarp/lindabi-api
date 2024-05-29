"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("profile_pictures");
  },
  down: (queryInterface, Sequelize) => { }
};