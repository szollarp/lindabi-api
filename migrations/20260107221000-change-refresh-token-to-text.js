'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('refresh_tokens', 'token', {
            type: Sequelize.DataTypes.TEXT,
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Note: This might fail if there are tokens longer than 255 chars in the DB
        await queryInterface.changeColumn('refresh_tokens', 'token', {
            type: Sequelize.DataTypes.STRING(255),
            allowNull: false
        });
    }
};
