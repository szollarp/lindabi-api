"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("profile_pictures", "user_id");
  },
  down: (queryInterface, Sequelize) => { }
};