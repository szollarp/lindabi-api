import { Model, DataTypes } from "sequelize";
import type { Sequelize, NonAttribute, ForeignKey } from "sequelize";
import type { Models } from ".";
import { CreateWarehouseProperties, Warehouse } from "./interfaces/warehouse";
import { Tenant } from "./interfaces/tenant";

export class WarehouseModel extends Model<Warehouse, CreateWarehouseProperties> implements Warehouse {
  public id!: number;

  public name!: string;

  public country!: string;

  public region?: string | null;

  public city!: string;

  public address!: string;

  public zipCode!: string;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy?: number;

  public readonly updatedBy?: number | null;

  public static associate: (models: Models) => void;
};

export const WarehouseFactory = (sequelize: Sequelize): typeof WarehouseModel => {
  WarehouseModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
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
    tableName: "warehouses",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    deletedAt: "deletedOn",
    paranoid: true,
    underscored: true
  });

  return WarehouseModel;
}