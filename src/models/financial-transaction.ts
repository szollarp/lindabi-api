import { Model, DataTypes, type Sequelize, type NonAttribute, type ForeignKey, Association } from "sequelize";
import type { CreateFinancialTransactionProperties, FinancialTransaction } from "./interfaces/financial-transaction";
import type { Tenant } from "./interfaces/tenant";
import type { Models } from ".";
import { User } from "./interfaces/user";
import { Company } from "./interfaces/company";
import { CompanyModel } from "./company";
import { TenantModel } from "./tenant";
import { UserModel } from "./user";
import { Invoice } from "./interfaces/invoice";

export class FinancialTransactionModel extends Model<FinancialTransaction, CreateFinancialTransactionProperties> implements FinancialTransaction {
  public id!: number;

  public date!: Date;

  public amount!: number;

  public description!: string;

  public recipientId?: ForeignKey<User["id"]>;

  public recipient?: NonAttribute<User>;

  public recipientType!: "employee" | "cash desk";

  public payerId?: ForeignKey<User["id"]>;

  public payer?: NonAttribute<User>;

  public payerType!: "employee" | "cash desk";

  public contractorId!: ForeignKey<Company["id"]>;

  public contractor!: NonAttribute<Company>;

  declare tenant: NonAttribute<Tenant>;

  declare tenantId: ForeignKey<Tenant["id"]>;

  declare invoice?: NonAttribute<Invoice>;

  declare invoiceId?: ForeignKey<Invoice["id"]>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    contractor: Association<FinancialTransactionModel, CompanyModel>,
    recipient: Association<FinancialTransactionModel, UserModel>,
    payer: Association<FinancialTransactionModel, UserModel>,
    creator: Association<FinancialTransactionModel, UserModel>,
    tenant: Association<FinancialTransactionModel, TenantModel>
  };
}

export const FinancialTransactionFactory = (sequelize: Sequelize): typeof FinancialTransactionModel => {
  FinancialTransactionModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recipientType: {
      type: DataTypes.ENUM("employee", "cash desk"),
      allowNull: false
    },
    payerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    payerType: {
      type: DataTypes.ENUM("employee", "cash desk"),
      allowNull: false
    },
    contractorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    invoiceId: {
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
    }
  }, {
    sequelize,
    tableName: "financial_transactions",
    timestamps: true,
    createdAt: "created_on",
    updatedAt: "updated_on",
    paranoid: false,
    underscored: true
  });

  FinancialTransactionModel.associate = (models) => {
    FinancialTransactionModel.belongsTo(models.User, {
      foreignKey: "payer_id",
      as: "payer"
    });

    FinancialTransactionModel.belongsTo(models.User, {
      foreignKey: "recipient_id",
      as: "recipient"
    });

    FinancialTransactionModel.belongsTo(models.Company, {
      foreignKey: "contractor_id",
      as: "contractor"
    });

    FinancialTransactionModel.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator"
    });

    FinancialTransactionModel.belongsTo(models.Invoice, {
      foreignKey: "invoice_id",
      as: "invoice"
    });
  };

  return FinancialTransactionModel;
};