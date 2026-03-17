'use strict';

/**
 * Migration: Increase app_version and platform column lengths in refresh_tokens
 *
 * Problem: app_version was VARCHAR(20) but Expo sends version strings like
 * "1.0.0 (build 123456)" which can exceed 20 characters.
 * platform is kept at VARCHAR(20) but raised to VARCHAR(50) for safety.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('refresh_tokens', 'app_version', {
            type: Sequelize.DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            comment: 'Application version (e.g. 1.2.3 (build 456))'
        });

        await queryInterface.changeColumn('refresh_tokens', 'platform', {
            type: Sequelize.DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            comment: 'Device platform (ios, android, web)'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('refresh_tokens', 'app_version', {
            type: Sequelize.DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null
        });

        await queryInterface.changeColumn('refresh_tokens', 'platform', {
            type: Sequelize.DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null
        });
    }
};
