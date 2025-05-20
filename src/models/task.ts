import { Model, DataTypes } from "sequelize";
import type { Sequelize, Association, NonAttribute, ForeignKey, HasManyAddAssociationMixin, HasManyRemoveAssociationMixin } from "sequelize";
import type { Models } from ".";
import type { Task, CreateTaskProperties } from "./interfaces/task";
import type { Project } from "./interfaces/project";
import type { Tender } from "./interfaces/tender";
import type { TaskComment } from "./interfaces/task-comment";
import { ProjectModel } from "./project";
import { TenderModel } from "./tender";
import { TaskCommentModel } from "./task-comment";
import { Tenant } from "./interfaces/tenant";
import { User } from "./interfaces/user";
import { UserModel } from "./user";
import { TaskColumn } from "./interfaces/task-column";
import { TaskColumnModel } from "./task-column";
import { Document } from "./interfaces/document";
import { DocumentModel } from "./document";

export class TaskModel extends Model<Task, CreateTaskProperties> implements Task {
  public id!: number;
  public uid!: string;
  public title!: string;
  public description?: string;
  public position!: number;
  public type!: "task" | "fix";
  public priority!: "low" | "medium" | "high";
  public dueDate!: Date;

  public columnId!: ForeignKey<TaskColumn["id"]>;
  public column?: NonAttribute<TaskColumn>;

  public projectId?: ForeignKey<Project["id"]>;
  public project?: NonAttribute<Project>;

  public tenderId?: ForeignKey<Tender["id"]>;
  public tender?: NonAttribute<Tender>;

  public comments?: NonAttribute<TaskComment[]>;

  public tenantId!: ForeignKey<Tenant["id"]>;
  public tenant?: NonAttribute<Tenant>;

  public assignee?: NonAttribute<User[]>;
  public assigneeIds?: ForeignKey<User["id"]>[];

  public addAssignee!: HasManyAddAssociationMixin<UserModel, number>;

  public removeAssignee!: HasManyRemoveAssociationMixin<UserModel, number>;

  public attachments?: NonAttribute<Document[]>;

  public attachmentIds?: ForeignKey<Document["id"][]>;

  public reporter?: User | undefined;

  public readonly createdOn!: Date;
  public readonly updatedOn!: Date | null;
  public readonly createdBy!: number;
  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    project: Association<TaskModel, ProjectModel>;
    tender: Association<TaskModel, TenderModel>;
    comments: Association<TaskModel, TaskCommentModel>;
    assignee: Association<TaskModel, UserModel>;
    column: Association<TaskModel, TaskColumnModel>;
    reporter: Association<TaskModel, UserModel>;
    attachments: Association<TenderModel, DocumentModel>,
  };
}

export const TaskFactory = (sequelize: Sequelize): typeof TaskModel => {
  TaskModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.STRING,
      autoIncrement: true
    },
    uid: {
      unique: true,
      type: DataTypes.STRING
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM("task", "fix"),
      allowNull: false,
      defaultValue: "task"
    },
    columnId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tenderId: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    tableName: "tasks",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  TaskModel.associate = (models) => {
    TaskModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "task"
      },
      as: "attachments"
    });

    TaskModel.belongsToMany(models.User, {
      foreignKey: "task_id",
      through: "task_users",
      as: "assignee"
    });

    TaskModel.belongsTo(models.Project, { foreignKey: "project_id" });
    TaskModel.belongsTo(models.Tender, { foreignKey: "tender_id" });
    TaskModel.belongsTo(models.TaskColumn, { foreignKey: "column_id", as: "column" });
    TaskModel.hasMany(models.TaskComment, { foreignKey: "task_id", as: "comments" });
    TaskModel.belongsTo(models.User, { foreignKey: "created_by", as: "reporter" });
  };

  return TaskModel;
};
