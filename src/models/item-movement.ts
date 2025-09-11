import { Model, DataTypes } from "sequelize";
import type { Sequelize, NonAttribute, ForeignKey } from "sequelize";
import type { Models } from ".";
import { CreateItemMovementProperties, ItemMovement } from "./interfaces/item-movement";
import { Warehouse } from "./interfaces/warehouse";
import { Project } from "./interfaces/project";
import { ItemModel } from "./item";
import { Item } from "./interfaces/item";
import { Tenant } from "./interfaces/tenant";
import { User } from "./interfaces/user";

export class ItemMovementModel extends Model<ItemMovement, CreateItemMovementProperties> implements ItemMovement {
  public id!: number;

  public type!: 'issue' | 'return' | 'transfer';

  public itemId!: ForeignKey<Item["id"]>;

  public quantity!: number;

  public employeeId?: ForeignKey<User["id"]>;

  public source?: 'warehouse' | 'project';

  public sourceId?: ForeignKey<Warehouse["id"] | Project["id"]>;

  public target?: 'warehouse' | 'project';

  public targetId?: ForeignKey<Warehouse["id"] | Project["id"]>;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly sourceWarehouse?: NonAttribute<Warehouse>;

  public readonly sourceProject?: NonAttribute<Project>;

  public readonly targetWarehouse?: NonAttribute<Warehouse>;

  public readonly targetProject?: NonAttribute<Project>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy?: number;

  public readonly updatedBy?: number | null;

  public static associate: (models: Models) => void;
};

export const ItemMovementFactory = (sequelize: Sequelize) => {
  ItemMovementModel.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('issue', 'return', 'transfer'),
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ItemModel,
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM('warehouse', 'project'),
      allowNull: true,
    },
    sourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    target: {
      type: DataTypes.ENUM('warehouse', 'project'),
      allowNull: true,
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdOn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    tableName: "item_movements",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  ItemMovementModel.associate = (models) => {
    ItemMovementModel.belongsTo(models.Warehouse, {
      as: 'sourceWarehouse',
      foreignKey: 'source_id',
      constraints: false
    });

    ItemMovementModel.belongsTo(models.Project, {
      as: 'sourceProject',
      foreignKey: 'source_id',
      constraints: false
    });

    ItemMovementModel.belongsTo(models.Warehouse, {
      as: 'targetWarehouse',
      foreignKey: 'target_id',
      constraints: false
    });

    ItemMovementModel.belongsTo(models.Project, {
      as: 'targetProject',
      foreignKey: 'target_id',
      constraints: false
    });

    ItemMovementModel.belongsTo(models.Item, {
      as: 'item',
      foreignKey: 'item_id'
    });

    ItemMovementModel.belongsTo(models.User, {
      as: 'employee',
      foreignKey: 'employee_id'
    });
  };

  return ItemMovementModel;
}