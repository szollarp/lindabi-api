import { Model, DataTypes } from "sequelize";
import type { Association, ForeignKey, NonAttribute, Sequelize } from "sequelize";
import type { Models } from ".";
import { Project } from "./interfaces/project";
import { ProjectModel } from "./project";
import { UserModel } from "./user";
import { User } from "./interfaces/user";
import { CompletionCertificate, CreateCompletionCertificateProperties } from "./interfaces/completion-certificate";
import { OrderForm } from "./interfaces/order-form";
import { OrderFormModel } from "./order-form";
import { COMPLETION_CERTIFICATE_STATUS } from "../constants";
import { Tenant } from "./interfaces/tenant";

export class CompletionCertificateModel extends Model<CompletionCertificate, CreateCompletionCertificateProperties> implements CompletionCertificate {
  public id!: number;

  public amount!: number;

  public status!: COMPLETION_CERTIFICATE_STATUS;

  public deviation?: string | null;

  public description?: string | null;

  public employeeId!: ForeignKey<User["id"]>;

  public employee!: NonAttribute<User>;

  public orderFormId!: ForeignKey<OrderForm["id"]>;

  public orderForm!: NonAttribute<OrderForm>;

  public projectId!: ForeignKey<Project["id"]>;

  public project?: NonAttribute<Project>;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;

  public readonly createdBy!: number;

  public readonly updatedOn!: Date | null;

  public readonly updatedBy!: number | null;

  public readonly approvedOn!: Date | null;

  public readonly approvedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    project: Association<CompletionCertificateModel, ProjectModel>,
    employee: Association<CompletionCertificateModel, UserModel>,
    orderForm: Association<CompletionCertificateModel, OrderFormModel>
  };
}

export const CompletionCertificateFactory = (sequelize: Sequelize): typeof CompletionCertificateModel => {
  CompletionCertificateModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    deviation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: COMPLETION_CERTIFICATE_STATUS.DRAFT,
      allowNull: false
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approvedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderFormId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "completion_certificates",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  CompletionCertificateModel.associate = (models) => {
    CompletionCertificateModel.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project"
    });

    CompletionCertificateModel.belongsTo(models.User, {
      foreignKey: "employeeId",
      as: "employee"
    });

    CompletionCertificateModel.belongsTo(models.OrderForm, {
      foreignKey: "orderFormId",
      as: "orderForm"
    });
  };

  return CompletionCertificateModel;
};
