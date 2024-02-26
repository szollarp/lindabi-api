"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      return await Promise.all([
        queryInterface.addColumn("profile_pictures", "owner_id", {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        }, { transaction: t }),
        queryInterface.addColumn("profile_pictures", "owner_type", {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        }, { transaction: t })
      ])
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      return await Promise.all([
        queryInterface.removeColumn("profile_pictures", "owner_id", { transaction: t }),
        queryInterface.removeColumn("profile_pictures", "owner_type", { transaction: t })
      ]);
    });
  }
};