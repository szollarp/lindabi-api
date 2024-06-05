'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('tender_items', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      quantity: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      unit: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      material_net_unit_amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      material_net_amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      material_actual_net_amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      fee_net_unit_amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      fee_net_amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      fee_actual_net_amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      total_material_amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      total_fee_amount: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false
      },
      tender_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      created_on: {
        type: Sequelize.DataTypes.DATE
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tender_items');
  }
};
