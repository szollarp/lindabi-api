"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("milestones", "restraint_amount", {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("milestones", "restraint_date", {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("milestones", "technical_inspector", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      })
    ])
  },
  down: async (queryInterface) => {
    return await Promise.all([
      queryInterface.removeColumn("milestones", "restraint_amount"),
      queryInterface.removeColumn("milestones", "restraint_date"),
      queryInterface.removeColumn("milestones", "technical_inspector")
    ]);
  }
};