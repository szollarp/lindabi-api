import { Model, DataTypes } from "sequelize";
import type { Sequelize, NonAttribute, ForeignKey } from "sequelize";
import type { Models } from ".";
import { CreateFinancialSettingProperties, FinancialSetting } from "./interfaces/financial-setting";
import { Tenant } from "./interfaces/tenant";
import { FINANCIAL_SETTING_TYPE } from "../constants";

export class FinancialSettingModel extends Model<FinancialSetting, CreateFinancialSettingProperties> implements FinancialSetting {
  public id!: number;

  public type!: FINANCIAL_SETTING_TYPE;

  public startDate!: Date;

  public endDate?: Date | null;

  public amount?: number | null;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;
};

export const FinancialSettingFactory = (sequelize: Sequelize): typeof FinancialSettingModel => {
  FinancialSettingModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: FINANCIAL_SETTING_TYPE.KM_RATE
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    amount: {
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
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "financial_settings",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  return FinancialSettingModel;
};
