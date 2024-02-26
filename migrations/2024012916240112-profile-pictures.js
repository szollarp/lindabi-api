'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('profile_pictures', {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
      },
      image: {
        type: Sequelize.DataTypes.BLOB("long"),
        allowNull: false
      },
      mime_type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      created_on: {
        type: Sequelize.DataTypes.DATE
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      user_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        unique: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('profile_pictures');
  }
};
