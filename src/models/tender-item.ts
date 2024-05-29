import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, NonAttribute, Sequelize
} from "sequelize";
import type { Models } from ".";
import { TENDER_CURRENCY } from "../constants";
import { Tender } from "./interfaces/tender";
import { CreateTenderItemProperties, TenderItem } from "./interfaces/tender-item";
import { TenderModel } from "./tender";

export class TenderItemModel extends Model<TenderItem, CreateTenderItemProperties> implements TenderItem {
  public id!: number;

  public name!: string;

  public quantity!: number;

  public unit!: string;

  public vatKey!: string;

  public currency!: TENDER_CURRENCY;

  public surcharge!: number | null;

  public discount!: number | null;

  public materialNetUnitAmount!: number;

  public materialNetAmount!: number;

  public materialAmount!: number;

  public feeNetUnitAmount!: number;

  public feeNetAmount!: number;

  public feeAmount!: number;

  public totalMaterialNetAmount!: number;

  public totalFeeNetAmount!: number;

  public totalNetAmount!: number;

  public totalAmount!: number;

  public tenderId!: ForeignKey<Tender["id"]>;

  public tender?: NonAttribute<Tender>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    tender: Association<TenderItemModel, TenderModel>
  };
}

export const TenderItemFactory = (sequelize: Sequelize): typeof TenderItemModel => {
  TenderItemModel.init({
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vatKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    surcharge: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null
    },
    discount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null
    },
    materialNetUnitAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    materialNetAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    materialAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    feeNetUnitAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    feeNetAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    feeAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    totalMaterialNetAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    totalFeeNetAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    totalNetAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    tenderId: {
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
    tableName: "tender_items",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  TenderItemModel.associate = (models) => {
    TenderItemModel.belongsTo(models.Tender);
  };

  return TenderItemModel;
};
