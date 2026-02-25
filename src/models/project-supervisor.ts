import { Model, DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";
import { CreateProjectSupervisorProperties, ProjectSupervisor } from "./interfaces/project-supervisor";
import type { Models } from ".";
import { User } from "./interfaces/user";

export class ProjectSupervisorModel extends Model<ProjectSupervisor, CreateProjectSupervisorProperties> implements ProjectSupervisor {
  public projectId!: number;

  public userId!: number;

  public readonly user?: User;

  public startDate!: Date | null;

  public endDate!: Date | null;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date;

  public static associate: (models: Models) => void;

  public static associations: {};
};

export const ProjectSupervisorFactory = (sequelize: Sequelize): typeof ProjectSupervisorModel => {
  ProjectSupervisorModel.init({
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "project_id"
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id"
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "start_date"
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "end_date"
    },
    createdOn: {
      type: DataTypes.DATE,
      field: "created_on"
    },
    updatedOn: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
      field: "updated_on"
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
    ProjectSupervisorModel.belongsTo(models.Project, {
      foreignKey: "projectId"
    });

    ProjectSupervisorModel.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user"
    });
  };

  return ProjectSupervisorModel;
};
