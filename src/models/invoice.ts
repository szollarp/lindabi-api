import { Association, DataTypes, ForeignKey, Model, NonAttribute, Sequelize } from "sequelize";
import { CreateInvoiceProperties, Invoice } from "./interfaces/invoice";
import { INVOICE_PAYMENT_TYPE, INVOICE_STATUS, INVOICE_TYPE } from "../constants";
import { Project } from "./interfaces/project";
import { Milestone } from "./interfaces/milestone";
import { Company } from "./interfaces/company";
import { User } from "./interfaces/user";
import { Document } from "./interfaces/document";
import { DocumentModel } from "./document";
import { Models } from ".";
import { Tenant } from "./interfaces/tenant";

export class InvoiceModel extends Model<Invoice, CreateInvoiceProperties> implements Invoice {
  public id!: number;

  public type!: INVOICE_TYPE;

  public status!: INVOICE_STATUS;

  public invoiceNumber!: string;

  public paymentType!: INVOICE_PAYMENT_TYPE;

  public note!: string | null;

  public completionDate!: Date | null;

  public issueDate!: Date | null;

  public paymentDate!: Date | null;

  public netAmount!: number;

  public vatAmount!: number;

  public vatKey!: string;

  public title!: string | null;

  public asEmail!: boolean;

  public pattyCash!: boolean;

  public inSalary!: boolean;

  public projectId?: ForeignKey<Project["id"]>;

  public project?: NonAttribute<Project>;

  public milestoneId?: ForeignKey<Milestone["id"]>;

  public milestone?: NonAttribute<Milestone>;

  public contractorId?: ForeignKey<Company["id"]>;

  public contractor?: NonAttribute<Company>;

  public employeeId?: ForeignKey<User["id"]>;

  public employee?: NonAttribute<User>;

  public supplierId?: ForeignKey<Company["id"]>;

  public supplier?: NonAttribute<Company>;

  declare documents?: NonAttribute<Document[]>;

  declare documentIds?: ForeignKey<Document["id"][]>;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public approvedBy!: User["id"] | null;

  public readonly approver!: User;

  public approvedOn!: Date | null;

  public payedOn!: Date | null;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: User["id"];

  public readonly creator!: User;

  public readonly updatedBy!: User["id"] | null;

  public static associate: (models: Models) => void;

  public static associations: {
    documents: Association<InvoiceModel, DocumentModel>
  };
}

export const InvoiceFactory = (sequelize: Sequelize): typeof InvoiceModel => {
  InvoiceModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: INVOICE_TYPE.EMPLOYEE
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: INVOICE_STATUS.CREATED
      },
      paymentType: {
        type: DataTypes.STRING,
        defaultValue: INVOICE_PAYMENT_TYPE.bank,
        allowNull: false
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true
      },
      completionDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      issueDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      netAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      vatAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      vatKey: {
        type: DataTypes.STRING,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      asEmail: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      pattyCash: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      inSalary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      milestoneId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      contractorId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      documentId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdOn: {
        type: DataTypes.DATE
      },
      updatedOn: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      approvedOn: {
        type: DataTypes.DATE,
        allowNull: true
      },
      payedOn: {
        type: DataTypes.DATE,
        allowNull: true
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
    sequelize,
    tableName: "invoices",
    timestamps: true,
    createdAt: "created_on",
    updatedAt: "updated_on",
    underscored: true
  });

  InvoiceModel.associate = (models) => {
    InvoiceModel.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project"
    });

    InvoiceModel.belongsTo(models.Milestone, {
      foreignKey: "milestone_id",
      as: "milestone"
    });

    InvoiceModel.belongsTo(models.Company, {
      foreignKey: "contractor_id",
      as: "contractor"
    });

    InvoiceModel.belongsTo(models.Company, {
      foreignKey: "supplier_id",
      as: "supplier"
    });

    InvoiceModel.belongsTo(models.User, {
      foreignKey: "employee_id",
      as: "employee"
    });

    InvoiceModel.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator"
    });

    InvoiceModel.belongsTo(models.User, {
      foreignKey: "approved_by",
      as: "approver"
    });

    InvoiceModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "invoice"
      },
      as: "documents"
    });

    InvoiceModel.hasOne(models.FinancialTransaction, {
      foreignKey: "invoice_id",
      as: "invoice"
    });
  }

  return InvoiceModel;
};