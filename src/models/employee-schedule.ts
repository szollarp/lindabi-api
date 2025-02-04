import { Association, DataTypes, ForeignKey, Model, NonAttribute, Sequelize } from "sequelize";
import { CreateEmployeeScheduleProperties, EmployeeSchedule, EmployeeScheduleType } from "./interfaces/employee-schedule";
import { User } from "./interfaces/user";
import { Project } from "./interfaces/project";
import { ProjectModel } from "./project";
import { UserModel } from "./user";
import { Models } from ".";
import { Tenant } from "./interfaces/tenant";

export class EmployeeScheduleModel extends Model<EmployeeSchedule, CreateEmployeeScheduleProperties> implements EmployeeSchedule {
  public id!: number;

  public type!: EmployeeScheduleType;

  public startDate!: Date;

  public endDate!: Date;

  public employeeId!: ForeignKey<User["id"]>;

  public employee!: NonAttribute<User>;

  public projectId!: ForeignKey<Project["id"]>;

  public project?: NonAttribute<Project>;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public creator?: NonAttribute<User>;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    project: Association<EmployeeScheduleModel, ProjectModel>,
    employee: Association<EmployeeScheduleModel, UserModel>,
  };
};

export const EmployeeScheduleFactory = (sequelize: Sequelize): typeof EmployeeScheduleModel => {
  EmployeeScheduleModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
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
    },
  }, {
    sequelize,
    tableName: "employee_schedules",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  EmployeeScheduleModel.associate = (models) => {
    EmployeeScheduleModel.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project"
    });

    EmployeeScheduleModel.belongsTo(models.User, {
      foreignKey: "employee_id",
      as: "employee"
    });
  };

  return EmployeeScheduleModel;
}