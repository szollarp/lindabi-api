import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, HasManyAddAssociationMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, NonAttribute, Sequelize
} from "sequelize";
import type { CreateTenantProperties, Tenant } from "./interfaces/tenant";
import type { Models } from ".";
import type { SubscriptionModel } from "./subscription";
import type { Subscription } from "./interfaces/subscription";
import type { User } from "./interfaces/user";
import type { UserModel } from "./user";
import type { DocumentModel } from "./document";
import type { Document } from "./interfaces/document";
import { TENANT_STATUS } from "../constants";

export class TenantModel extends Model<Tenant, CreateTenantProperties> implements Tenant {
  public id!: number;

  public name!: string;

  public email!: string;

  public status!: TENANT_STATUS.ACTIVE | TENANT_STATUS.INACTIVE

  public country!: string;

  public region!: string | null;

  public city!: string;

  public zipCode!: string;

  public address!: string;

  public taxNumber!: string;

  public registrationNumber!: string;

  public bankAccount?: string | null;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  declare subscriptions?: NonAttribute<Subscription[]>;

  declare subscriptionIds?: Array<ForeignKey<Subscription["id"]>>;

  public getSubscriptions!: HasManyGetAssociationsMixin<SubscriptionModel[]>;

  public createSubscription!: HasManyCreateAssociationMixin<SubscriptionModel>;

  public addSubscription!: HasManyAddAssociationMixin<SubscriptionModel, number>;

  public createDocument!: HasManyCreateAssociationMixin<DocumentModel>;

  public getDocuments!: HasManyCreateAssociationMixin<DocumentModel>;

  declare documents?: NonAttribute<Document[]>;

  declare documentIds?: ForeignKey<Document["id"][]>;

  public users?: NonAttribute<User[]>;

  declare userIds?: Array<ForeignKey<User["id"]>>;

  public static associate: (models: Models) => void;

  public static associations: {
    subscription: Association<TenantModel, SubscriptionModel>
    documents: Association<TenantModel, DocumentModel>
    user: Association<TenantModel, UserModel>
  };
};

export const TenantFactory = (sequelize: Sequelize): typeof TenantModel => {
  TenantModel.init({
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
      allowNull: false
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
    taxNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bankAccount: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: TENANT_STATUS.ACTIVE
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
    tableName: "tenants",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  TenantModel.associate = (models) => {
    TenantModel.hasMany(models.Subscription, {
      foreignKey: "tenant_id",
      as: "subscriptions"
    });

    TenantModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "tenant"
      },
      as: "documents"
    });

    TenantModel.hasMany(models.User, {
      foreignKey: "tenant_id",
      as: "users"
    });

    TenantModel.hasMany(models.Role, {
      foreignKey: "tenant_id",
      as: "roles"
    });
  };

  return TenantModel;
};
