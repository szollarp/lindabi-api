'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("tracking_events", {
      id: {
        unique: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true
      },
      tenant_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      project_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      event_type: {
        type: Sequelize.DataTypes.ENUM("entry", "exit", "gps_signal_lost", "gps_signal_recovered", "app_background", "app_foreground", "app_init", "note"),
        allowNull: false
      },
      latitude: {
        type: Sequelize.DataTypes.DECIMAL(10, 7),
        allowNull: true,
        defaultValue: null
      },
      longitude: {
        type: Sequelize.DataTypes.DECIMAL(10, 7),
        allowNull: true,
        defaultValue: null
      },
      occurred_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      metadata: {
        type: Sequelize.DataTypes.JSON,
        allowNull: true,
        defaultValue: null
      },
      app_version: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      created_on: {
        type: Sequelize.DataTypes.DATE
      },
      updated_on: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      },
      deleted_on: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tracking_events");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_tracking_events_event_type\";");
  }
};
