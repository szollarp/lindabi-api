import { Model, DataTypes } from "sequelize";
import type {
  Sequelize, Association, HasOneGetAssociationMixin, HasOneCreateAssociationMixin, NonAttribute,
  ForeignKey, HasManyAddAssociationMixin, HasOneSetAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCreateAssociationMixin
} from "sequelize";
import { USER_STATUS } from "../constants";
import type { AccountVerifyTokenModel } from "./account-verify-token";
import type { RefreshTokenModel } from "./refresh-token";
import type { ForgottenPasswordTokenModel } from "./forgotten-password-token";
import type { CreateUserProperties, User } from "./interfaces/user";
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

  public notifications?: Record<string, boolean> | undefined;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly deletedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public readonly deletedBy!: number | null;

  public readonly lastLoggedIn!: Date | null;

  public static associate: (models: Models) => void;

  public addRole!: HasManyAddAssociationMixin<Role, number>;

  public setRole!: HasOneSetAssociationMixin<Role, number>;

  public getRole!: HasOneGetAssociationMixin<Role>;

  declare role?: NonAttribute<Role>;

  declare roleId?: ForeignKey<Role["id"]>;

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



  public static associations: {
    accountVerifyToken: Association<UserModel, AccountVerifyTokenModel>
    refreshToken: Association<UserModel, RefreshTokenModel>
    twoFactorSession: Association<UserModel, TwoFactorSessionModel>
    twoFactorAuthentication: Association<UserModel, TwoFactorAuthenticationModel>
    documents: Association<UserModel, DocumentModel>
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

    UserModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "user"
      },
      as: "documents"
    });
  };

  return UserModel;
};
