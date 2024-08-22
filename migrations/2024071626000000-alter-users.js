"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("users", "entity", {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: "user"
      }),
      queryInterface.addColumn("users", "enable_login", {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }),
      queryInterface.addColumn("users", "identifier", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "employee_type", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "notes", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "birth_name", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "mother_name", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "place_of_birth", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "date_of_birth", {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "social_security_number", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "tax_identification_number", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "personal_identification_number", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("users", "license_plate_number", {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      })
    ])
  },
  down: async (queryInterface) => {
    return await Promise.all([
      queryInterface.removeColumn("users", "type"),
      queryInterface.removeColumn("users", "enable_login"),
      queryInterface.removeColumn("users", "identifier"),
      queryInterface.removeColumn("users", "employee_type"),
      queryInterface.removeColumn("users", "notes"),
      queryInterface.removeColumn("users", "birth_name"),
      queryInterface.removeColumn("users", "mother_name"),
      queryInterface.removeColumn("users", "place_of_birth"),
      queryInterface.removeColumn("users", "date_of_birth"),
      queryInterface.removeColumn("users", "social_security_number"),
      queryInterface.removeColumn("users", "tax_identification_number"),
      queryInterface.removeColumn("users", "personal_identification_number"),
      queryInterface.removeColumn("users", "license_plate_number")
    ]);
  }
};