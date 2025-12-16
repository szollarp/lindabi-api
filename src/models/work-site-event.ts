import { Model, DataTypes } from "sequelize";
import type { Sequelize, ForeignKey, NonAttribute } from "sequelize";
import type { Models } from ".";
import type { CreateWorkSiteEventProperties, WorkSiteEvent } from "./interfaces/work-site-event";
import type { Project } from "./interfaces/project";
import { ProjectModel } from "./project";

export class WorkSiteEventModel extends Model<WorkSiteEvent, CreateWorkSiteEventProperties> implements WorkSiteEvent {
  declare id: number;
  declare tenantId: number;
  declare userId: number;
  declare projectId: number | null;
  declare project?: NonAttribute<Project | null>;
  declare eventType: WorkSiteEvent["eventType"];
  declare latitude: number | null;
  declare longitude: number | null;
  declare metadata: Record<string, any> | null;
  declare occurredAt: Date;
  declare appVersion: string | null;
  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deleted: boolean;
  declare deletedAt: Date | null;

  declare tenantIdRef: ForeignKey<number>;
  declare userIdRef: ForeignKey<number>;
  declare projectIdRef: ForeignKey<number>;

  public static associate: (models: Models) => void;
}

export const WorkSiteEventFactory = (sequelize: Sequelize): typeof WorkSiteEventModel => {
  WorkSiteEventModel.init(
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id"
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: "project_id"
      },
      eventType: {
        type: DataTypes.ENUM("first_entry", "entry", "exit", "work_start_at_site", "gps_signal_lost", "gps_signal_recovered", "app_background", "app_foreground", "app_init", "note"),
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
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: "deleted_at"
      }
    },
    {
      sequelize,
      tableName: "work_site_events",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true
    }
  );

  WorkSiteEventModel.associate = (models) => {
    WorkSiteEventModel.belongsTo(models.Tenant, { foreignKey: "tenant_id" });
    WorkSiteEventModel.belongsTo(models.User, { foreignKey: "user_id" });
    WorkSiteEventModel.belongsTo(models.Project, { foreignKey: "project_id", as: "project" });

    WorkSiteEventModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "work_site_event"
      },
      as: "documents"
    });
  };

  return WorkSiteEventModel;
};
