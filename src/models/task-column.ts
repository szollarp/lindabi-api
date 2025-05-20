import { Model, DataTypes } from "sequelize";
import type { Sequelize, NonAttribute, ForeignKey, Association } from "sequelize";
import { Tenant } from "./interfaces/tenant";
import { CreateTaskColumnProperties, TaskColumn } from "./interfaces/task-column";
import type { Models } from ".";
import { TaskModel } from "./task";

export class TaskColumnModel extends Model<TaskColumn, CreateTaskColumnProperties> implements TaskColumn {
  public id!: number;
  public uid!: string;
  public name!: string;
  public position!: number;

  public fixed?: boolean;
  public finished?: boolean;

  public tenantId!: ForeignKey<Tenant["id"]>;
  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;
  public readonly updatedOn!: Date | null;
  public readonly createdBy!: number;
  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    tasks: Association<TaskColumnModel, TaskModel>;
  };
}

export const TaskColumnFactory = (sequelize: Sequelize): typeof TaskColumnModel => {
  TaskColumnModel.init({
    id: {
      unique: true,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    uid: {
      unique: true,
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fixed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    finished: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
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
      allowNull: true,
      defaultValue: null
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "task_columns",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  TaskColumnModel.associate = (models) => {
    TaskColumnModel.hasMany(models.Task, { foreignKey: "column_id", as: "tasks" });
  };

  return TaskColumnModel;
};
