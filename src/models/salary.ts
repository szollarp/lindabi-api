import { Model, DataTypes } from "sequelize";
import type { Sequelize, Association, NonAttribute, ForeignKey } from "sequelize";
import type { Models } from ".";
import { CreateSalaryProperties, Salary } from "./interfaces/salary";
import { UserModel } from "./user";
import { User } from "./interfaces/user";

export class SalaryModel extends Model<Salary, CreateSalaryProperties> implements Salary {
  public id!: number;

  public startDate!: Date;

  public endDate?: Date | null;

  public hourlyRate?: number | null;

  public dailyRate?: number | null;

  public userId!: ForeignKey<User["id"]>;

  public user?: NonAttribute<User>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    user: Association<SalaryModel, UserModel>
  };
};

export const SalaryFactory = (sequelize: Sequelize): typeof SalaryModel => {
  SalaryModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
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
    hourlyRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    dailyRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    userId: {
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
    tableName: "salaries",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  SalaryModel.associate = (models) => {
    SalaryModel.belongsTo(models.User, {
      foreignKey: "user_id"
    });
  };

  return SalaryModel;
};
