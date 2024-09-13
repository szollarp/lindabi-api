"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("projects", "contract_option", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: "skip"
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("projects", "contract_option")
  }
};