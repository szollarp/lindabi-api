'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(`
      ALTER TYPE enum_item_movements_type ADD VALUE 'procurement';
    `);
    },

    down: async (queryInterface, Sequelize) => {
        // Note: PostgreSQL does not support removing enum values directly
        // This down migration would require recreating the enum and updating all references
        // For safety, we're leaving this as a no-op
        // If you need to rollback, you'll need to manually handle the enum modification
        console.log('WARNING: Cannot automatically remove enum value. Manual intervention required.');
        return Promise.resolve();
    }
};
