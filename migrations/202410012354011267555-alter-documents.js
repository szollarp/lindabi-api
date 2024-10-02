"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      return await Promise.all([
        queryInterface.removeColumn("documents", "preview", { transaction: t }),
        queryInterface.removeColumn("documents", "data", { transaction: t }),
        queryInterface.removeColumn("documents", "size", { transaction: t })
      ])
    });
  },
  down: (queryInterface) => { }
};