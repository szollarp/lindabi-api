import { Model, DataTypes } from "sequelize";
import type { Sequelize, NonAttribute, ForeignKey } from "sequelize";
import type { Models } from ".";
import { CreateTenderItemsSearchProperties, TenderItemsSearch } from "./interfaces/tender-items-search";
import { Tenant } from "./interfaces/tenant";
import { TenderItem } from "./interfaces/tender-item";
import { TenantModel } from "./tenant";
import { TenderItemModel } from "./tender-item";

export class TenderItemsSearchModel extends Model<TenderItemsSearch, CreateTenderItemsSearchProperties> implements TenderItemsSearch {
  public id!: number;

  public tenderItemId!: ForeignKey<TenderItem["id"]>;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public active!: boolean;

  public name!: string;

  public normalizedName!: string;

  public unit?: string | null;

  public defaultPriceNet?: number | null;

  public currency?: string | null;

  public vatRate?: number | null;

  public usageCount!: number;

  public lastUsedAt?: Date | null;

  public aliasNames!: string[];

  public tags!: string[];

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public tenderItem?: NonAttribute<TenderItem>;

  public tenant?: NonAttribute<Tenant>;

  public static associate: (models: Models) => void;
}

export const TenderItemsSearchFactory = (sequelize: Sequelize): typeof TenderItemsSearchModel => {
  TenderItemsSearchModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tenderItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tender_item_id',
        references: {
          model: TenderItemModel,
          key: 'id',
        },
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tenant_id',
        references: {
          model: TenantModel,
          key: 'id',
        },
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      normalizedName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'normalized_name',
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      defaultPriceNet: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'default_price_net',
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      vatRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'vat_rate',
      },
      usageCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'usage_count',
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_used_at',
      },
      aliasNames: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        field: 'alias_names',
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: "tender_items_search",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      paranoid: false,
      underscored: true,
    }
  );

  TenderItemsSearchModel.associate = (models) => {
    TenderItemsSearchModel.belongsTo(models.TenderItem, {
      foreignKey: "tenderItemId",
      as: "tenderItem",
    });
    TenderItemsSearchModel.belongsTo(models.Tenant, {
      foreignKey: "tenantId",
      as: "tenant",
    });
  };

  return TenderItemsSearchModel;
};
