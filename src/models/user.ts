import { Model, DataTypes } from "sequelize";
import type {
  Sequelize, Association, HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin, NonAttribute,
  ForeignKey, HasOneSetAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCreateAssociationMixin
} from "sequelize";
import { USER_STATUS, USER_TYPE } from "../constants";
import type { AccountVerifyTokenModel } from "./account-verify-token";
import type { RefreshTokenModel } from "./refresh-token";
import type { ForgottenPasswordTokenModel } from "./forgotten-password-token";
import type { CreateUserProperties, User, UserBilling, NotificationSettings } from "./interfaces/user";
import type { Role } from "./interfaces/role";
import type { AccountVerifyToken } from "./interfaces/account-verify-token";
import type { ForgottenPasswordToken } from "./interfaces/forgotten-password-token";
import type { RefreshToken } from "./interfaces/refresh-token";
import type { TwoFactorSession } from "./interfaces/two-factor-session";
import type { TwoFactorSessionModel } from "./two-factor-session";
import type { TwoFactorAuthentication } from "./interfaces/two-factor-authentication";
import type { TwoFactorAuthenticationModel } from "./two-factor-authentication";
import type { Tenant } from "./interfaces/tenant";
import type { Document } from "./interfaces/document";
import type { DocumentModel } from "./document";
import type { Models } from ".";
import { Contact } from "./interfaces/contact";
import { ContactModel } from "./contact";
import { SalaryModel } from "./salary";
import { ExecutionModel } from "./execution";
import { InvoiceModel } from "./invoice";
import { EmployeeScheduleModel } from "./employee-schedule";
import { Salary } from "./interfaces/salary";
import { Invoice } from "./interfaces/invoice";
import { Execution } from "./interfaces/execution";
import { EmployeeSchedule } from "./interfaces/employee-schedule";
import { Notification } from "./interfaces/notification";
import { NotificationModel } from "./notification";

export class UserModel extends Model<User, CreateUserProperties> implements User {
  public id!: number;

  public name!: string;

  public email!: string;

  public password!: string;

  public phoneNumber!: string | null;

  public salt!: string;

  public status!: USER_STATUS.ACTIVE | USER_STATUS.INACTIVE | USER_STATUS.DISABLED | USER_STATUS.PENDING;

  public enableTwoFactor!: boolean;

  public country!: string | null;

  public region!: string | null;

  public city!: string | null;

  public zipCode!: string | null;

  public address!: string | null;

  public notifications?: NotificationSettings | undefined;

  public entity!: USER_TYPE.USER | USER_TYPE.EMPLOYEE;

  public enableLogin!: boolean;

  public identifier!: string | null;

  public employeeType!: string | null;

  public inSchedule!: boolean;

  public notes!: string | null;

  public birthName!: string | null;

  public motherName!: string | null;

  public placeOfBirth!: string | null;

  public dateOfBirth!: Date | null;

  public socialSecurityNumber!: string | null;

  public taxIdentificationNumber!: string | null;

  public personalIdentificationNumber!: string | null;

  public licensePlateNumber!: string | null;

  public properties?: Record<string, unknown> | {};

  public billing?: UserBilling | {};

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly deletedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public readonly deletedBy!: number | null;

  public readonly lastLoggedIn!: Date | null;

  public static associate: (models: Models) => void;

  public addRole!: HasOneSetAssociationMixin<Role, number>;

  public setRole!: HasOneSetAssociationMixin<Role, number>;

  public getRole!: HasOneGetAssociationMixin<Role>;

  declare role?: NonAttribute<Role>;

  declare roleId?: ForeignKey<Role["id"]>;

  public setContact!: HasOneSetAssociationMixin<Contact, number>;

  public getContact!: HasOneGetAssociationMixin<Contact>;

  declare contact?: NonAttribute<Contact>;

  declare contactId?: ForeignKey<Contact["id"]>;

  declare tenant?: NonAttribute<Tenant>;

  declare tenantId?: ForeignKey<Tenant["id"]>;

  public createAccountVerifyToken!: HasOneCreateAssociationMixin<AccountVerifyTokenModel>;

  public getAccountVerifyToken!: HasOneGetAssociationMixin<AccountVerifyTokenModel>;

  declare accountVerifyToken?: NonAttribute<AccountVerifyToken>;

  declare accountVerifyTokenId?: ForeignKey<AccountVerifyToken["id"]>;

  public createForgottenPasswordToken!: HasOneCreateAssociationMixin<ForgottenPasswordTokenModel>;

  public getForgottenPasswordToken!: HasOneGetAssociationMixin<ForgottenPasswordTokenModel>;

  declare forgottenPasswordToken?: NonAttribute<ForgottenPasswordToken>;

  declare forgottenPasswordTokenId?: ForeignKey<ForgottenPasswordToken["id"]>;

  public createRefreshToken!: HasOneCreateAssociationMixin<RefreshTokenModel>;

  public getRefreshToken!: HasOneGetAssociationMixin<RefreshTokenModel>;

  public setRefreshToken!: HasOneSetAssociationMixin<RefreshTokenModel, number>;

  declare refreshToken?: NonAttribute<RefreshToken>;

  declare refreshTokenId?: ForeignKey<RefreshToken["id"]>;

  public createTwoFactorSession!: HasOneCreateAssociationMixin<TwoFactorSessionModel>;

  public getTwoFactorSession!: HasOneGetAssociationMixin<TwoFactorSessionModel>;

  public setTwoFactorSession!: HasOneSetAssociationMixin<TwoFactorSessionModel, number>;

  declare twoFactorSession?: NonAttribute<TwoFactorSession>;

  declare twoFactorSessionId?: ForeignKey<TwoFactorSession["id"]>;

  public createTwoFactorAuthentication!: HasOneCreateAssociationMixin<TwoFactorAuthenticationModel>;

  public getTwoFactorAuthentication!: HasOneGetAssociationMixin<TwoFactorAuthenticationModel>;

  public setTwoFactorAuthentication!: HasOneSetAssociationMixin<TwoFactorAuthenticationModel, number>;

  declare twoFactorAuthentication?: NonAttribute<TwoFactorAuthentication>;

  declare twoFactorAuthenticationId?: ForeignKey<TwoFactorAuthentication["id"]>;

  public createDocument!: HasManyCreateAssociationMixin<DocumentModel>;

  public getDocuments!: HasManyGetAssociationsMixin<DocumentModel>;

  declare documents?: NonAttribute<Document[]>;

  declare documentIds?: ForeignKey<Document["id"][]>;

  public createSalary!: HasManyCreateAssociationMixin<SalaryModel>;

  public getSalaries!: HasManyGetAssociationsMixin<SalaryModel>;

  declare salaries?: NonAttribute<Salary[]>;

  declare salaryIds?: ForeignKey<Salary["id"][]>;

  declare executions?: NonAttribute<Execution[]>;

  declare executionIds?: ForeignKey<Execution["id"][]>;

  declare invoices?: NonAttribute<Invoice[]>;

  declare invoiceIds?: ForeignKey<Invoice["id"][]>;

  public createSchedules!: HasManyCreateAssociationMixin<EmployeeScheduleModel>;

  public getSchedules!: HasManyGetAssociationsMixin<EmployeeScheduleModel>;

  declare schedules?: NonAttribute<EmployeeSchedule[]>;

  declare scheduleIds?: ForeignKey<EmployeeSchedule["id"][]>;

  public createNotification!: HasManyCreateAssociationMixin<NotificationModel>;

  public getNotifications!: HasManyGetAssociationsMixin<NotificationModel>;

  declare uiNotifications?: NonAttribute<Notification[]>;

  declare notificationIds?: ForeignKey<Notification["id"]>[];

  declare itemMovements?: NonAttribute<any[]>;

  public static associations: {
    accountVerifyToken: Association<UserModel, AccountVerifyTokenModel>
    refreshToken: Association<UserModel, RefreshTokenModel>
    twoFactorSession: Association<UserModel, TwoFactorSessionModel>
    twoFactorAuthentication: Association<UserModel, TwoFactorAuthenticationModel>
    documents: Association<UserModel, DocumentModel>
    contact: Association<UserModel, ContactModel>
    salaries: Association<UserModel, SalaryModel>
    executions: Association<UserModel, ExecutionModel>
    invoices: Association<UserModel, InvoiceModel>
    schedules: Association<UserModel, EmployeeScheduleModel>
    notifications: Association<UserModel, NotificationModel>
    itemMovements: Association<UserModel, any>
  };
}

export const UserFactory = (sequelize: Sequelize): typeof UserModel => {
  UserModel.init(
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false
      },
      region: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      zipCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: USER_STATUS.ACTIVE
      },
      enableTwoFactor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      notifications: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      entity: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: USER_TYPE.USER
      },
      inSchedule: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      enableLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      identifier: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      employeeType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      birthName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      motherName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      placeOfBirth: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      socialSecurityNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      taxIdentificationNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      personalIdentificationNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      licensePlateNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      properties: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      billing: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      createdBy: {
        type: DataTypes.INTEGER
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      deletedBy: {
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
      deletedOn: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      },
      lastLoggedIn: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
      createdAt: "createdOn",
      updatedAt: "updatedOn",
      deletedAt: "deletedOn",
      paranoid: true,
      underscored: true
    }
  );

  UserModel.associate = (models) => {
    UserModel.hasOne(models.AccountVerifyToken, {
      foreignKey: "user_id",
      as: "accountVerifyToken"
    });

    UserModel.hasOne(models.ForgottenPasswordToken, {
      foreignKey: "user_id",
      as: "forgottenPasswordToken"
    });

    UserModel.hasOne(models.RefreshToken, {
      foreignKey: "user_id",
      as: "refreshToken"
    });

    UserModel.belongsTo(models.Role, {
      foreignKey: "role_id", as: "role"
    });

    UserModel.belongsTo(models.Tenant, {
      foreignKey: "tenant_id", as: "tenant"
    });

    UserModel.hasOne(models.TwoFactorSession, {
      foreignKey: "user_id",
      as: "twoFactorSession"
    });

    UserModel.hasOne(models.TwoFactorAuthentication, {
      foreignKey: "user_id",
      as: "twoFactorAuthentication"
    });

    UserModel.hasOne(models.Contact, {
      foreignKey: "user_id",
      as: "contact"
    });

    UserModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "user"
      },
      as: "documents"
    });

    UserModel.hasMany(models.Salary, {
      foreignKey: "user_id",
      as: "salaries"
    });

    UserModel.hasMany(models.Execution, {
      foreignKey: "employee_id",
      as: "executions"
    });

    UserModel.hasMany(models.OrderForm, {
      foreignKey: "employee_id",
      as: "orderForms"
    });

    UserModel.hasMany(models.CompletionCertificate, {
      foreignKey: "employee_id",
      as: "completionCertificates"
    });

    UserModel.hasMany(models.Invoice, {
      foreignKey: "employee_id",
      as: "invoices"
    });

    UserModel.hasMany(models.EmployeeSchedule, {
      foreignKey: "employee_id",
      as: "schedules"
    });

    UserModel.belongsToMany(models.Task, {
      foreignKey: "user_id",
      through: "task_users",
      as: "tasks"
    });

    UserModel.hasMany(models.Notification, {
      foreignKey: "user_id",
      as: "uiNotifications"
    });

    UserModel.hasMany(models.ItemMovement, {
      foreignKey: "employee_id",
      as: "itemMovements"
    });
  };

  return UserModel;
};
