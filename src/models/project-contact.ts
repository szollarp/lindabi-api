import { Model, DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";

import { CreateProjectContactProperties, ProjectContact } from "./interfaces/project-contact";
import type { Models } from ".";
import { Contact } from "./interfaces/contact";

export class ProjectContactModel extends Model<ProjectContact, CreateProjectContactProperties> implements ProjectContact {
  public projectId!: number;

  public contactId!: number;

  public readonly contact?: Contact;

  public userContact!: boolean;

  public canShow!: boolean;

  public customerContact!: boolean;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date;

  public static associate: (models: Models) => void;

  public static associations: {};
};

export const ProjectContactFactory = (sequelize: Sequelize): typeof ProjectContactModel => {
  ProjectContactModel.init({
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userContact: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    canShow: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    customerContact: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    tableName: "project_contacts",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  ProjectContactModel.associate = (models) => {
    ProjectContactModel.belongsToMany(models.Project, {
      foreignKey: "project_id",
      through: "project_contacts",
    });

    ProjectContactModel.belongsToMany(models.Contact, {
      foreignKey: "contact_id",
      through: "project_contacts",
      "as": "contact"
    });
  };

  return ProjectContactModel;
};
