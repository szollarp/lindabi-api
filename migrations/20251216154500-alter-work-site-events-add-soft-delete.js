'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add deleted column
        await queryInterface.addColumn('work_site_events', 'deleted', {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });

        // Add deleted_at column
        await queryInterface.addColumn('work_site_events', 'deleted_at', {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove deleted_at column
        await queryInterface.removeColumn('work_site_events', 'deleted_at');

        // Remove deleted column
        await queryInterface.removeColumn('work_site_events', 'deleted');
    }
};
