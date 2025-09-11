'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.DataTypes.ENUM(
          'user_new',
          'user_update',
          'user_delete',
          'user_update_role',
          'tender_new',
          'tender_approved',
          'tender_status_change',
          'tender_awaiting_approval',
          'contact_new',
          'contact_update',
          'customer_new',
          'customer_update',
          'contractor_new',
          'contractor_update',
          'permission_matrix_update',
          'project_new',
          'project_update',
          'project_status_change',
          'task_new',
          'task_update',
          'task_assigned',
          'task_completed',
          'invoice_new',
          'invoice_approved',
          'invoice_paid',
          'execution_new',
          'execution_approved',
          'system_maintenance',
          'general'
        ),
        allowNull: false,
      },
      status: {
        type: Sequelize.DataTypes.ENUM('unread', 'read', 'archived'),
        allowNull: false,
        defaultValue: 'unread',
      },
      priority: {
        type: Sequelize.DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
      },
      data: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
        defaultValue: null,
      },
      read_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      archived_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      user_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      deleted_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      created_on: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true,
      },
      deleted_on: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('notifications');
  }
};
