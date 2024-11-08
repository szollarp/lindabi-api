import { Model, DataTypes } from "sequelize";
import type { Association, ForeignKey, NonAttribute, Sequelize } from "sequelize";
import type { Models } from ".";
import { ORDER_FORM_STATUS } from "../constants";
import { Project } from "./interfaces/project";
import { ProjectModel } from "./project";
import { UserModel } from "./user";
import { User } from "./interfaces/user";
import { CreateOrderFormProperties, OrderForm } from "./interfaces/order-form";
import { Contact } from "./interfaces/contact";
import { ContactModel } from "./contact";
import { Tenant } from "./interfaces/tenant";

export class OrderFormModel extends Model<OrderForm, CreateOrderFormProperties> implements OrderForm {
  public id!: number;

  public number!: string;

  public status!: ORDER_FORM_STATUS;

  public amount!: number;

  public issueDate!: Date;

  public siteHandoverDate!: Date;

  public deadlineDate!: Date;

  public financialSchedule?: string | null;

  public description?: string | null;

  public otherNotes?: string | null;

  public employeeId!: ForeignKey<User["id"]>;

  public employee!: NonAttribute<User>;

  public managerId!: ForeignKey<Contact["id"]>;

  public manager!: NonAttribute<Contact>;

  public projectId!: ForeignKey<Project["id"]>;

  public project?: NonAttribute<Project>;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public creator?: NonAttribute<User>;

  public readonly updatedBy!: number | null;

  public approveCode!: string;

  public readonly approvedOn!: Date | null;

  public static associate: (models: Models) => void;

  public static associations: {
    project: Association<OrderFormModel, ProjectModel>,
    employee: Association<OrderFormModel, UserModel>,
    manager: Association<OrderFormModel, ContactModel>,
    creator: Association<OrderFormModel, UserModel>
  };
}

export const OrderFormFactory = (sequelize: Sequelize): typeof OrderFormModel => {
  OrderFormModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: ORDER_FORM_STATUS.CREATED,
      allowNull: false
    },
    amount: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    siteHandoverDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deadlineDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    financialSchedule: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    otherNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedOn: {
      type: DataTypes.DATE,
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
    approveCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    approvedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    managerId: {
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
    tableName: "order_forms",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  OrderFormModel.associate = (models) => {
    OrderFormModel.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project"
    });

    OrderFormModel.belongsTo(models.User, {
      foreignKey: "employee_id",
      as: "employee"
    });

    OrderFormModel.belongsTo(models.Contact, {
      foreignKey: "manager_id",
      as: "manager"
    });

    OrderFormModel.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator"
    });

    OrderFormModel.hasOne(models.CompletionCertificate, {
      foreignKey: "order_form_id",
      as: "completionCertificate"
    });

  };

  return OrderFormModel;
};
