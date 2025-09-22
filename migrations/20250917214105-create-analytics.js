'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analytics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        unique: true
      },
      type: {
        type: Sequelize.ENUM('basket_values', 'quote_success_rate', 'job_profitability', 'quote_date_analytics'),
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      period: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'yearly', 'all_time'),
        allowNull: false
      },
      period_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      period_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_on: {
        type: Sequelize.DATE,
        defaultValue: null,
        allowNull: true
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('analytics', ['tenant_id', 'type', 'period'], {
      name: 'analytics_tenant_type_period_idx'
    });

    await queryInterface.addIndex('analytics', ['tenant_id', 'type'], {
      name: 'analytics_tenant_type_idx'
    });

    await queryInterface.addIndex('analytics', ['updated_on'], {
      name: 'analytics_updated_on_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analytics');
  }
};
