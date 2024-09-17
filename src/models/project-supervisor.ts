import { Model, DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";
import { CreateProjectSupervisorProperties, ProjectSupervisor } from "./interfaces/project-supervisor";
import type { Models } from ".";
import { Contact } from "./interfaces/contact";

export class ProjectSupervisorModel extends Model<ProjectSupervisor, CreateProjectSupervisorProperties> implements ProjectSupervisor {
  public projectId!: number;

  public contactId!: number;

  public readonly contact?: Contact;

  public readonly startDate!: Date | null;

  public readonly endDate!: Date | null;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date;

  public static associate: (models: Models) => void;

  public static associations: {};
};

export const ProjectSupervisorFactory = (sequelize: Sequelize): typeof ProjectSupervisorModel => {
  ProjectSupervisorModel.init({
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: "project_supervisors",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  ProjectSupervisorModel.associate = (models) => {
    ProjectSupervisorModel.belongsToMany(models.Project, {
      foreignKey: "project_id",
      through: "project_supervisors",
    });

    ProjectSupervisorModel.belongsToMany(models.Contact, {
      foreignKey: "contact_id",
      through: "project_supervisors",
      as: "contact"
    });
  };

  return ProjectSupervisorModel;
};
