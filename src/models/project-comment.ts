import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, NonAttribute, Sequelize
} from "sequelize";
import { Project } from "./interfaces/project";
import { ProjectModel } from "./project";
import { CreateProjectCommentProperties, ProjectComment } from "./interfaces/project-comment";
import { Contact } from "./interfaces/contact";
import { ContactModel } from "./contact";
import type { Models } from ".";

export class ProjectCommentModel extends Model<ProjectComment, CreateProjectCommentProperties> implements ProjectComment {
  public id!: number;

  public notes!: string;

  public checked!: boolean;

  public contactId!: ForeignKey<Contact["id"]>;

  public contact?: NonAttribute<Contact>;

  public projectId!: ForeignKey<Project["id"]>;

  public project?: NonAttribute<Project>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    project: Association<ProjectCommentModel, ProjectModel>
    contact: Association<ProjectCommentModel, ContactModel>
  };
}

export const ProjectCommentFactory = (sequelize: Sequelize): typeof ProjectCommentModel => {
  ProjectCommentModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    checked: {
      type: DataTypes.BOOLEAN,
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
      defaultValue: null,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: "project_comments",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  ProjectCommentModel.associate = (models) => {
    ProjectCommentModel.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project"
    });

    ProjectCommentModel.belongsTo(models.Contact, {
      foreignKey: "contactId",
      as: "contact"
    });
  };

  return ProjectCommentModel;
};
