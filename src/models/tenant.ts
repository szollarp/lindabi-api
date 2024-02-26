import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin, NonAttribute, Sequelize
} from "sequelize";
import type { CreateTenantProperties, Tenant } from "./interfaces/tenant";
import type { Models } from ".";
import type { SubscriptionModel } from "./subscription";
import type { Subscription } from "./interfaces/subscription";
import type { ProfilePictureModel } from "./profile-picture";
import type { ProfilePicture } from "./interfaces/profile-picture";
import type { User } from "./interfaces/user";
import type { UserModel } from "./user";
import { TENANT_STATUS } from "../constants";

export class TenantModel extends Model<Tenant, CreateTenantProperties> implements Tenant {
  public id!: number;

  public name!: string;

  public email!: string;

  public status!: keyof typeof TENANT_STATUS;

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

  public createLogo!: HasOneCreateAssociationMixin<ProfilePictureModel>;

  public getLogo!: HasOneGetAssociationMixin<ProfilePictureModel>;

  declare logo?: NonAttribute<ProfilePicture>;

  declare logoId?: ForeignKey<ProfilePicture["id"]>;

  public users?: NonAttribute<User[]>;

  declare userIds?: Array<ForeignKey<User["id"]>>;

  public static associate: (models: Models) => void;

  public static associations: {
    subscription: Association<TenantModel, SubscriptionModel>
    logo: Association<TenantModel, ProfilePictureModel>
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

    TenantModel.hasOne(models.ProfilePicture, {
      foreignKey: "owner_id",
      as: "logo",
      scope: {
        ownerType: "tenant"
      }
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
