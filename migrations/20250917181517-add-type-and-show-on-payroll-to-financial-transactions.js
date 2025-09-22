'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('financial_transactions', 'type', {
      type: Sequelize.DataTypes.ENUM('salary', 'material'),
      allowNull: false,
      defaultValue: 'material'
    });

    await queryInterface.addColumn('financial_transactions', 'show_on_payroll', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('financial_transactions', 'show_on_payroll');
    await queryInterface.removeColumn('financial_transactions', 'type');
  }
};
