'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the tender_items_search table
    await queryInterface.createTable('tender_items_search', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tender_item_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tender_items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tenant_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      active: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      normalized_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      unit: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      default_price_net: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      currency: {
        type: Sequelize.DataTypes.STRING(3),
        allowNull: true,
      },
      vat_rate: {
        type: Sequelize.DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      usage_count: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_used_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      alias_names: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      tags: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for performance
    await queryInterface.addIndex('tender_items_search', ['tenant_id', 'active'], {
      name: 'idx_tender_items_search_tenant_active',
    });

    await queryInterface.addIndex('tender_items_search', ['usage_count', 'last_used_at'], {
      name: 'idx_tender_items_search_usage',
    });

    // Create GIN index for normalized_name using pg_trgm extension
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY idx_tender_items_search_normalized_name_trgm 
      ON tender_items_search USING gin (normalized_name gin_trgm_ops);
    `);

    // Create GIN index for alias_names
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY idx_tender_items_search_alias_names_gin 
      ON tender_items_search USING gin (alias_names);
    `);

    // Create GIN index for tags
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY idx_tender_items_search_tags_gin 
      ON tender_items_search USING gin (tags);
    `);

    // Create unique constraint on tender_item_id to prevent duplicates
    await queryInterface.addConstraint('tender_items_search', {
      fields: ['tender_item_id'],
      type: 'unique',
      name: 'uq_tender_items_search_tender_item_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop indexes first
    await queryInterface.removeIndex('tender_items_search', 'idx_tender_items_search_tenant_active');
    await queryInterface.removeIndex('tender_items_search', 'idx_tender_items_search_usage');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_tender_items_search_normalized_name_trgm;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_tender_items_search_alias_names_gin;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_tender_items_search_tags_gin;');

    // Drop the table
    await queryInterface.dropTable('tender_items_search');
  }
};
