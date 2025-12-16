'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove work_site_id column
    await queryInterface.removeColumn('work_site_events', 'work_site_id');

    // Remove work_site_name column if it exists
    const tableDescription = await queryInterface.describeTable('work_site_events');
    if (tableDescription.work_site_name) {
      await queryInterface.removeColumn('work_site_events', 'work_site_name');
    }

    // Add project_id column
    await queryInterface.addColumn('work_site_events', 'project_id', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    });

    // Add metadata column (JSONB)
    await queryInterface.addColumn('work_site_events', 'metadata', {
      type: Sequelize.DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    });

    // Add foreign key constraint for project_id
    await queryInterface.addConstraint('work_site_events', {
      fields: ['project_id'],
      type: 'foreign key',
      name: 'work_site_events_project_id_fkey',
      references: {
        table: 'projects',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraint
    await queryInterface.removeConstraint('work_site_events', 'work_site_events_project_id_fkey');

    // Remove metadata column
    await queryInterface.removeColumn('work_site_events', 'metadata');

    // Remove project_id column
    await queryInterface.removeColumn('work_site_events', 'project_id');

    // Restore work_site_id column
    await queryInterface.addColumn('work_site_events', 'work_site_id', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });

    // Restore work_site_name column
    await queryInterface.addColumn('work_site_events', 'work_site_name', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
  }
};

