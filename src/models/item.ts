import { Model, DataTypes } from "sequelize";
import type { Sequelize, NonAttribute, ForeignKey } from "sequelize";
import type { Models } from ".";
import { CreateItemProperties, Item } from "./interfaces/item";
import { Tenant } from "./interfaces/tenant";
import { TenantModel } from "./tenant";

export class ItemModel extends Model<Item, CreateItemProperties> implements Item {
  public id!: number;

  public name!: string;

  public manufacturer?: string | null;

  public description?: string | null;

  public category?: string | null;

  public netAmount?: number | null;

  public vatKey!: string;

  public unit?: string | null;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly itemMovements?: NonAttribute<any[]>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy?: number;

  public readonly updatedBy?: number | null;

  public static associate: (models: Models) => void;
};

export const ItemFactory = (sequelize: Sequelize): typeof ItemModel => {
  ItemModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      netAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      manufacturer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vatKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: TenantModel,
          key: 'id',
        },
      },
    },
    {
      sequelize,
      tableName: "items",
      timestamps: true,
      createdAt: "createdOn",
      updatedAt: "updatedOn",
      deletedAt: "deletedOn",
      paranoid: true,
      underscored: true
    }
  );

  ItemModel.associate = (models) => {
    ItemModel.belongsTo(models.Tenant, { foreignKey: "tenantId", as: "tenant" });
    ItemModel.hasMany(models.ItemMovement, { foreignKey: "itemId", as: "itemMovements" });
  };

  return ItemModel;
};