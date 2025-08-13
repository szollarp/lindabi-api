import { Association, DataTypes, ForeignKey, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, Model, NonAttribute, Sequelize } from "sequelize";
import { CreateMilestoneProperties, Milestone } from "./interfaces/milestone";
import { Project } from "./interfaces/project";
import { ProjectModel } from "./project";
import { MILESTONE_STATUS } from "../constants";
import { DocumentModel } from "./document";
import { Document } from "./interfaces/document";
import type { Models } from ".";

export class MilestoneModel extends Model<Milestone, CreateMilestoneProperties> implements Milestone {
  public id!: number;

  public name!: string;

  public dueDate!: Date;

  public netAmount?: number | null;

  public notes?: string;

  public status!: MILESTONE_STATUS;

  public invoiceNumber?: string | null;

  public invoiceDate?: Date | null;

  public tigNotes?: string | null;

  public restraintAmount?: number | null;

  public restraintDate?: Date | null;

  public technicalInspector?: string | null;

  public projectId!: ForeignKey<Project["id"]>;

  public project?: NonAttribute<Project>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public getDocuments!: HasManyGetAssociationsMixin<DocumentModel[]>;

  public createDocument!: HasManyCreateAssociationMixin<DocumentModel>;

  declare documents?: NonAttribute<Document[]>;

  declare documentIds?: ForeignKey<Document["id"][]>;

  public static associate: (models: Models) => void;

  public static associations: {
    project: Association<MilestoneModel, ProjectModel>,
    documents: Association<MilestoneModel, DocumentModel>
  };
}

export const MilestoneFactory = (sequelize: Sequelize): typeof MilestoneModel => {
  MilestoneModel.init(
    {
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
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      netAmount: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: MILESTONE_STATUS.IN_PROGRESS
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      invoiceDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      tigNotes: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      restraintAmount: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: null
      },
      restraintDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      technicalInspector: {
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
    },
    {
      sequelize,
      tableName: "milestones",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true
    });

  MilestoneModel.associate = (models) => {
    MilestoneModel.belongsTo(models.Project, {
      foreignKey: "project_id", as: "project"
    });

    MilestoneModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "milestone"
      },
      as: "documents"
    });

    MilestoneModel.hasMany(models.Invoice, {
      foreignKey: "milestone_id",
      as: "invoices"
    });
  };

  return MilestoneModel;
};
