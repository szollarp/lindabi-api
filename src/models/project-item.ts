import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, NonAttribute, Sequelize
} from "sequelize";
import type { Models } from ".";
import { PROJECT_ITEM_STATUS, PROJECT_ITEM_TYPE } from "../constants";
import { CreateProjectItemProperties, ProjectItem } from "./interfaces/project-item";
import { Project } from "./interfaces/project";
import { ProjectModel } from "./project";

export class ProjectItemModel extends Model<ProjectItem, CreateProjectItemProperties> implements ProjectItem {
  public id!: number;

  public name!: string;

  public quantity!: number;

  public unit!: string;

  public num!: number;

  public type!: PROJECT_ITEM_TYPE;

  public status!: PROJECT_ITEM_STATUS;

  public netAmount!: number;

  public notes?: string | null;

  public projectId!: ForeignKey<Project["id"]>;

  public project?: NonAttribute<Project>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    project: Association<ProjectItemModel, ProjectModel>
  };
}

export const ProjectItemFactory = (sequelize: Sequelize): typeof ProjectItemModel => {
  ProjectItemModel.init({
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
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    num: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: PROJECT_ITEM_TYPE.DAILY
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: PROJECT_ITEM_STATUS.OPEN
    },
    netAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    projectId: {
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
    tableName: "project_items",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  ProjectItemModel.associate = (models) => {
    ProjectItemModel.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project"
    });
  };

  return ProjectItemModel;
};
