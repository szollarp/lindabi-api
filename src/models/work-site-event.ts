import { Model, DataTypes } from "sequelize";
import type { Sequelize, ForeignKey } from "sequelize";
import type { Models } from ".";
import type { CreateWorkSiteEventProperties, WorkSiteEvent } from "./interfaces/work-site-event";

export class WorkSiteEventModel extends Model<WorkSiteEvent, CreateWorkSiteEventProperties> implements WorkSiteEvent {
  declare id: number;
  declare tenantId: number;
  declare userId: number;
  declare workSiteId: string | null;
  declare workSiteName: string | null;
  declare eventType: WorkSiteEvent["eventType"];
  declare latitude: number | null;
  declare longitude: number | null;
  declare occurredAt: Date;
  declare createdBy: number | null;
  declare updatedBy: number | null;

  declare tenantIdRef: ForeignKey<number>;
  declare userIdRef: ForeignKey<number>;

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
      workSiteId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: "work_site_id"
      },
      workSiteName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: "work_site_name"
      },
      eventType: {
        type: DataTypes.ENUM("first_entry", "entry", "exit", "work_start_at_site", "gps_signal_lost", "gps_signal_recovered", "app_background", "app_foreground", "app_init"),
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
      occurredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "occurred_at"
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
  };

  return WorkSiteEventModel;
};
