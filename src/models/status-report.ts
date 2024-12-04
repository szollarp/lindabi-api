import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, NonAttribute, Sequelize
} from "sequelize";
import type { Models } from ".";
import { STATUS_REPORT_STATUS } from "../constants";
import { Project } from "./interfaces/project";
import { ProjectModel } from "./project";
import { CreateStatusReportProperties, StatusReport } from "./interfaces/status-report";
import { DocumentModel } from "./document";
import { Document } from "./interfaces/document";
import { UserModel } from "./user";
import { Tenant } from "./interfaces/tenant";
import { TenantModel } from "./tenant";

export class StatusReportModel extends Model<StatusReport, CreateStatusReportProperties> implements StatusReport {
  public id!: number;

  public availableToClient!: boolean;

  public status!: STATUS_REPORT_STATUS;

  public dueDate!: Date;

  public notes?: string | null;

  public projectId!: ForeignKey<Project["id"]>;

  public project?: NonAttribute<Project>;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public getDocuments!: HasManyGetAssociationsMixin<DocumentModel[]>;

  public createDocument!: HasManyCreateAssociationMixin<DocumentModel>;

  declare documents?: NonAttribute<Document[]>;

  declare documentIds?: ForeignKey<Document["id"][]>;

  public static associations: {
    tenant: Association<StatusReportModel, TenantModel>,
    project: Association<StatusReportModel, ProjectModel>,
    documents: Association<StatusReportModel, DocumentModel>,
    creator: Association<StatusReportModel, UserModel>,
    updater: Association<StatusReportModel, UserModel>,
  };
}

export const StatusReportFactory = (sequelize: Sequelize): typeof StatusReportModel => {
  StatusReportModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: STATUS_REPORT_STATUS.FINE
    },
    availableToClient: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dueDate: {
      type: DataTypes.DATE,
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
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "status_reports",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  StatusReportModel.associate = (models) => {
    StatusReportModel.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project"
    });

    StatusReportModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "report"
      },
      as: "documents"
    });

    StatusReportModel.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator"
    });

    StatusReportModel.belongsTo(models.User, {
      foreignKey: "updatedBy",
      as: "updater"
    });
  };

  return StatusReportModel;
};
