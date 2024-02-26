import { Model, DataTypes } from "sequelize";
import type { ForeignKey, HasOneGetAssociationMixin, NonAttribute, Sequelize } from "sequelize";
import type { Models } from ".";
import type { CreateSubscriptionProperties, Subscription } from "./interfaces/subscription";
import type { Tenant } from "./interfaces/tenant";

export class SubscriptionModel extends Model<Subscription, CreateSubscriptionProperties> implements Subscription {
  public id!: number;

  public name!: string;

  public dateStart!: Date;

  public dateEnd!: Date;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  declare tenant?: NonAttribute<Tenant>;

  declare tenantId?: ForeignKey<Tenant["id"]>;

  public getTenant!: HasOneGetAssociationMixin<Tenant>;

  public static associate: (models: Models) => void;
};

export const SubscriptionFactory = (sequelize: Sequelize): typeof SubscriptionModel => {
  SubscriptionModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateStart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    dateEnd: {
      type: DataTypes.DATE,
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
    tableName: "subscriptions",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  SubscriptionModel.associate = (models) => {
    SubscriptionModel.belongsTo(models.Tenant, {
      foreignKey: "tenant_id"
    });
  };

  return SubscriptionModel;
};
