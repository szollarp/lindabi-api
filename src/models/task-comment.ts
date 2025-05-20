import { Model, DataTypes } from "sequelize";
import type { Sequelize, Association, NonAttribute, ForeignKey } from "sequelize";
import type { Models } from ".";
import type { TaskComment, CreateTaskCommentProperties } from "./interfaces/task-comment";
import type { Task } from "./interfaces/task";
import { TaskModel } from "./task";
import { UserModel } from "./user";
import { Tenant } from "./interfaces/tenant";

export class TaskCommentModel extends Model<TaskComment, CreateTaskCommentProperties> implements TaskComment {
  public id!: number;
  public taskId!: ForeignKey<Task["id"]>;
  public task!: NonAttribute<Task>;
  public message!: string;

  public tenantId!: ForeignKey<Tenant["id"]>;
  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;
  public readonly updatedOn!: Date | null;
  public readonly createdBy!: number;
  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    task: Association<TaskCommentModel, TaskModel>;
    user: Association<TaskCommentModel, UserModel>;
  };
}

export const TaskCommentFactory = (sequelize: Sequelize): typeof TaskCommentModel => {
  TaskCommentModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
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
      allowNull: true,
      defaultValue: null
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "task_comments",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  TaskCommentModel.associate = (models) => {
    TaskCommentModel.belongsTo(models.Task, { foreignKey: "task_id" });
    TaskCommentModel.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
  };

  return TaskCommentModel;
};
