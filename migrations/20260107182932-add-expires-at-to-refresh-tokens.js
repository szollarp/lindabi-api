'use strict';

/**
 * Migration: Add expires_at column to refresh_tokens table
 * 
 * Purpose: Support refresh token expiration for improved security.
 * This adds an optional expiration timestamp to refresh tokens.
 * 
 * Backward compatible:
 * - Column is nullable (existing tokens: expires_at = NULL)
 * - NULL means no expiration (old behavior)
 * - Non-NULL means token expires at that timestamp
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('refresh_tokens', 'expires_at', {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Token expiration timestamp. NULL = no expiration (legacy tokens)'
        });

        // Add index for efficient expiration queries
        await queryInterface.addIndex('refresh_tokens', ['expires_at'], {
            name: 'idx_refresh_tokens_expires_at'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_expires_at');
        await queryInterface.removeColumn('refresh_tokens', 'expires_at');
    }
};
