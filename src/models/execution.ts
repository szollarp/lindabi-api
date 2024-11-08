import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, NonAttribute, Sequelize
} from "sequelize";
import type { Models } from ".";
import { EXECUTION_SETTLEMENT, EXECUTION_STATUS } from "../constants";
import { Project } from "./interfaces/project";
import { ProjectModel } from "./project";
import { DocumentModel } from "./document";
import { Document } from "./interfaces/document";
import { UserModel } from "./user";
import { CreateExecutionProperties, Execution } from "./interfaces/execution";
import { User } from "./interfaces/user";
import { Tenant } from "./interfaces/tenant";

export class ExecutionModel extends Model<Execution, CreateExecutionProperties> implements Execution {
  public id!: number;

  public type!: string;

  public settlement!: EXECUTION_SETTLEMENT;

  public dueDate!: Date;

  public quantity?: number;

  public unit?: string;

  public distance?: number

  public workdayStart?: string | null;

  public workdayEnd?: string | null;

  public breakStart?: string | null;

  public breakEnd?: string | null;

  public notes?: string | null;

  public status?: EXECUTION_STATUS | null;

  public employeeId!: ForeignKey<User["id"]>;

  public employee!: NonAttribute<User>;

  public projectId!: ForeignKey<Project["id"]>;

  public project?: NonAttribute<Project>;

  public approvedOn?: Date | null;

  public approvedBy?: ForeignKey<User["id"]>;

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
    project: Association<ExecutionModel, ProjectModel>,
    documents: Association<ExecutionModel, DocumentModel>,
    approver: Association<ExecutionModel, UserModel>,
    employee: Association<ExecutionModel, UserModel>
  };
}

export const ExecutionFactory = (sequelize: Sequelize): typeof ExecutionModel => {
  ExecutionModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    settlement: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: EXECUTION_SETTLEMENT.DAILY
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    distance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    workdayStart: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    workdayEnd: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    breakStart: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    breakEnd: {
      type: DataTypes.STRING,
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
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: EXECUTION_STATUS.PENDING
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    approvedOn: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
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
    tableName: "executions",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  ExecutionModel.associate = (models) => {
    ExecutionModel.belongsTo(models.User, {
      foreignKey: "employeeId",
      as: "employee"
    });

    ExecutionModel.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project"
    });

    ExecutionModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "execution"
      },
      as: "documents"
    });

    ExecutionModel.belongsTo(models.User, {
      foreignKey: "approvedBy",
      as: "approver"
    });
  };

  return ExecutionModel;
};
