import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, HasManyAddAssociationMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin, HasOneGetAssociationMixin, NonAttribute, Sequelize
} from "sequelize";
import type { Company, CreateCompanyProperties } from "./interfaces/company";
import { COMPANY_STATUS, COMPANY_TYPE } from "../constants";
import type { ProfilePictureModel } from "./profile-picture";
import type { ProfilePicture } from "./interfaces/profile-picture";
import type { LocationModel } from "./location";
import type { ContactModel } from "./contact";
import type { Location } from "./interfaces/location";
import type { Contact } from "./interfaces/contact";
import type { Models } from ".";
import type { Tenant } from "./interfaces/tenant";

export class CompanyModel extends Model<Company, CreateCompanyProperties> implements Company {
  public id!: number;

  public name!: string;

  public email?: string | null;

  public status!: COMPANY_STATUS.ACTIVE | COMPANY_STATUS.INACTIVE;

  public type!: COMPANY_TYPE.CONTRACTOR | COMPANY_TYPE.CUSTOMER;

  public default!: boolean | null;

  public country!: string;

  public region!: string | null;

  public city!: string;

  public zipCode!: string;

  public address!: string;

  public taxNumber?: string | null;

  public registrationNumber?: string | null;

  public bankAccount?: string | null;

  public prefix?: string | null;

  public notes?: string | null;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  declare tenantId?: ForeignKey<Tenant["id"]>;

  public createLogo!: HasOneGetAssociationMixin<ProfilePictureModel>;

  public getLogo!: HasOneGetAssociationMixin<ProfilePictureModel>;

  declare logo?: NonAttribute<ProfilePicture>;

  declare logoId?: ForeignKey<ProfilePicture["id"]>;

  public createLocation!: HasManyCreateAssociationMixin<LocationModel>;

  public addLocation!: HasManyAddAssociationMixin<LocationModel, number>;

  public getLocations!: HasManyGetAssociationsMixin<LocationModel[]>;

  public removeLocation!: HasManyRemoveAssociationMixin<LocationModel, number>;

  declare locations?: NonAttribute<Location[]>;

  public createContact!: HasManyCreateAssociationMixin<ContactModel>;

  public addContact!: HasManyAddAssociationMixin<ContactModel, number>;

  public getContacts!: HasManyGetAssociationsMixin<ContactModel[]>;

  public removeContact!: HasManyRemoveAssociationMixin<ContactModel, number>;

  declare contacts?: NonAttribute<Contact[]>;

  public static associate: (models: Models) => void;

  public static associations: {
    logo: Association<CompanyModel, ProfilePictureModel>
    locations: Association<CompanyModel, LocationModel>
    contacts: Association<CompanyModel, ContactModel>
  };
};

export const CompanyFactory = (sequelize: Sequelize): typeof CompanyModel => {
  CompanyModel.init(
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
        allowNull: true,
        defaultValue: null
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
        allowNull: true,
        defaultValue: null
      },
      registrationNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      bankAccount: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      prefix: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: COMPANY_STATUS.ACTIVE
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: COMPANY_TYPE.CONTRACTOR
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      tenantId: {
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
      }
    },
    {
      sequelize,
      tableName: "companies",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true
    });

  CompanyModel.associate = (models) => {
    CompanyModel.belongsToMany(models.Contact, {
      through: "company_contacts"
    });

    CompanyModel.belongsToMany(models.Location, {
      through: "company_locations"
    });

    CompanyModel.hasOne(models.ProfilePicture, {
      foreignKey: "owner_id",
      as: "logo",
      scope: {
        ownerType: "company"
      }
    });
  };

  return CompanyModel;
};
