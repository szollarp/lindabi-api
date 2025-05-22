import { Model, DataTypes } from "sequelize";
import type { Sequelize, NonAttribute, ForeignKey } from "sequelize";
import type { Models } from ".";
import { CreateWorkTypeProperties, WorkType } from "./interfaces/work-type";
import { Tenant } from "./interfaces/tenant";

export class WorkTypeModel extends Model<WorkType, CreateWorkTypeProperties> implements WorkType {
  public id!: number;

  public name!: string;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {};
};

export const WorkTypeFactory = (sequelize: Sequelize): typeof WorkTypeModel => {
  WorkTypeModel.init({
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
    tableName: "work_types",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  return WorkTypeModel;
};
