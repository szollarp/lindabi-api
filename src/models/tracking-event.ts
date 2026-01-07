import { Model, DataTypes } from "sequelize";
import type { Sequelize, ForeignKey, NonAttribute } from "sequelize";
import type { Models } from ".";
import type { CreateTrackingEventProperties, TrackingEvent } from "./interfaces/tracking-event";
import type { Project } from "./interfaces/project";

export class TrackingEventModel extends Model<TrackingEvent, CreateTrackingEventProperties> implements TrackingEvent {
  declare id: number;
  declare tenantId: number;
  declare userId: number;
  declare projectId: number | null;
  declare project?: NonAttribute<Project | null>;
  declare eventType: TrackingEvent["eventType"];
  declare latitude: number | null;
  declare longitude: number | null;
  declare metadata: Record<string, any> | null;
  declare occurredAt: Date;
  declare appVersion: string | null;
  declare createdBy: number | null;
  declare updatedBy: number | null;

  declare tenantIdRef: ForeignKey<number>;
  declare userIdRef: ForeignKey<number>;
  declare projectIdRef: ForeignKey<number>;

  public static associate: (models: Models) => void;
}

export const TrackingEventFactory = (sequelize: Sequelize): typeof TrackingEventModel => {
  TrackingEventModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "tenant_id"
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: "project_id"
      },
      eventType: {
        type: DataTypes.ENUM("entry", "exit", "gps_signal_lost", "gps_signal_recovered", "app_background", "app_foreground", "app_init", "note"),
        allowNull: false,
        field: "event_type"
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        defaultValue: null
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        defaultValue: null
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null
      },
      occurredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "occurred_at"
      },
      appVersion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: "app_version"
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: "created_by"
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: "updated_by"
      }
    },
    {
      sequelize,
      tableName: "tracking_events",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      deletedAt: "deleted_on",
      underscored: true,
      paranoid: true
    }
  );

  TrackingEventModel.associate = (models) => {
    TrackingEventModel.belongsTo(models.Tenant, { foreignKey: "tenant_id" });
    TrackingEventModel.belongsTo(models.User, { foreignKey: "created_by" });
    TrackingEventModel.belongsTo(models.Project, { foreignKey: "project_id", as: "project" });

    TrackingEventModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "work_site_event"
      },
      as: "documents"
    });
  };

  return TrackingEventModel;
};
