'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("work_site_events", {
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
      user_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      work_site_id: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      work_site_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      event_type: {
        type: Sequelize.DataTypes.ENUM("first_entry", "entry", "exit", "work_start_at_site"),
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
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("work_site_events");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_work_site_events_event_type\";");
  }
};
