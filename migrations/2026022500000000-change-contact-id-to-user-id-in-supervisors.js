'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table exists to avoid errors on init
        const tables = await queryInterface.showAllTables();
        if (tables.includes('project_supervisors')) {
            const columns = await queryInterface.describeTable('project_supervisors');
            if (columns.contact_id) {
                await queryInterface.renameColumn('project_supervisors', 'contact_id', 'user_id');
            }

            // Delete project supervisors whose contact doesn't correspond to a user
            await queryInterface.sequelize.query(`
                DELETE FROM project_supervisors 
                WHERE user_id NOT IN (SELECT id FROM contacts WHERE user_id IS NOT NULL);
            `);

            // Update data: replace old contact_id with actual user_id
            await queryInterface.sequelize.query(`
                UPDATE project_supervisors
                SET user_id = c.user_id
                FROM contacts c
                WHERE project_supervisors.user_id = c.id;
            `);

            // Delete any rows that might still violate the constraint
            await queryInterface.sequelize.query(`
                DELETE FROM project_supervisors 
                WHERE user_id NOT IN (SELECT id FROM users);
            `);

            // Update foreign key constraint
            // First, get the foreign key names
            const tableInfo = await queryInterface.getForeignKeyReferencesForTable('project_supervisors');
            const fk = tableInfo.find(t => t.columnName === 'user_id' || t.columnName === 'contact_id');

            if (fk && fk.constraintName) {
                await queryInterface.removeConstraint('project_supervisors', fk.constraintName);
            }

            await queryInterface.addConstraint('project_supervisors', {
                fields: ['user_id'],
                type: 'foreign key',
                name: 'project_supervisors_user_id_fkey',
                references: {
                    table: 'users',
                    field: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tables = await queryInterface.showAllTables();
        if (tables.includes('project_supervisors')) {
            const tableInfo = await queryInterface.getForeignKeyReferencesForTable('project_supervisors');
            const fk = tableInfo.find(t => t.columnName === 'user_id');

            if (fk && fk.constraintName) {
                await queryInterface.removeConstraint('project_supervisors', fk.constraintName);
            }

            const columns = await queryInterface.describeTable('project_supervisors');
            if (columns.user_id) {
                await queryInterface.renameColumn('project_supervisors', 'user_id', 'contact_id');
            }

            await queryInterface.sequelize.query(`
                UPDATE project_supervisors
                SET contact_id = c.id
                FROM contacts c
                WHERE project_supervisors.contact_id = c.user_id;
            `);

            await queryInterface.addConstraint('project_supervisors', {
                fields: ['contact_id'],
                type: 'foreign key',
                name: 'project_supervisors_contact_id_fkey',
                references: {
                    table: 'contacts',
                    field: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });
        }
    }
};
