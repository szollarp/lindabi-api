import { Model, DataTypes, type Sequelize, type NonAttribute, type ForeignKey, Association } from "sequelize";
import type { CreateAnalyticsProperties, Analytics } from "./interfaces/analytics";
import type { Tenant } from "./interfaces/tenant";
import type { Models } from ".";
import { TenantModel } from "./tenant";

export class AnalyticsModel extends Model<Analytics, CreateAnalyticsProperties> implements Analytics {
  public id!: number;

  public type!: "basket_values" | "quote_success_rate" | "job_profitability" | "quote_date_analytics";

  public data!: any; // JSON data for the analytics

  public period!: "daily" | "weekly" | "monthly" | "yearly" | "all_time";

  public periodStart!: Date;

  public periodEnd!: Date;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    tenant: Association<AnalyticsModel, TenantModel>;
  };
}

export const AnalyticsFactory = (sequelize: Sequelize): typeof AnalyticsModel => {
  AnalyticsModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    type: {
      type: DataTypes.ENUM("basket_values", "quote_success_rate", "job_profitability", "quote_date_analytics"),
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    period: {
      type: DataTypes.ENUM("daily", "weekly", "monthly", "yearly", "all_time"),
      allowNull: false
    },
    periodStart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    periodEnd: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    createdOn: {
      type: DataTypes.DATE
    },
    updatedOn: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: "analytics",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  AnalyticsModel.associate = (models) => {
    AnalyticsModel.belongsTo(models.Tenant, {
      foreignKey: "tenantId",
      as: "tenant"
    });
  };

  return AnalyticsModel;
};
