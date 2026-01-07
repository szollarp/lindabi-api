'use strict';

/**
 * Migration: Add session metadata columns to refresh_tokens table
 * 
 * Purpose: Store device information and activity tracking for better
 * multi-device session management and security monitoring.
 * 
 * Added columns:
 * - platform: Device platform (ios, android, web)
 * - os_version: Operating system version
 * - app_version: Application version
 * - device_model: Device model name
 * - last_activity: Last activity timestamp
 * - ip_address: IP address (optional)
 * 
 * Backward compatible: All columns are nullable
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('refresh_tokens', 'platform', {
            type: Sequelize.DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            comment: 'Device platform (ios, android, web)'
        });

        await queryInterface.addColumn('refresh_tokens', 'os_version', {
            type: Sequelize.DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            comment: 'Operating system version'
        });

        await queryInterface.addColumn('refresh_tokens', 'app_version', {
            type: Sequelize.DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            comment: 'Application version'
        });

        await queryInterface.addColumn('refresh_tokens', 'device_model', {
            type: Sequelize.DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null,
            comment: 'Device model name (e.g., iPhone 13 Pro)'
        });

        await queryInterface.addColumn('refresh_tokens', 'last_activity', {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
            defaultValue: Sequelize.literal('NOW()'),
            comment: 'Last activity timestamp'
        });

        await queryInterface.addColumn('refresh_tokens', 'ip_address', {
            type: Sequelize.DataTypes.STRING(45),
            allowNull: true,
            defaultValue: null,
            comment: 'IP address (IPv4 or IPv6)'
        });

        // Add index for last_activity queries
        await queryInterface.addIndex('refresh_tokens', ['last_activity'], {
            name: 'idx_refresh_tokens_last_activity'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_last_activity');
        await queryInterface.removeColumn('refresh_tokens', 'platform');
        await queryInterface.removeColumn('refresh_tokens', 'os_version');
        await queryInterface.removeColumn('refresh_tokens', 'app_version');
        await queryInterface.removeColumn('refresh_tokens', 'device_model');
        await queryInterface.removeColumn('refresh_tokens', 'last_activity');
        await queryInterface.removeColumn('refresh_tokens', 'ip_address');
    }
};
