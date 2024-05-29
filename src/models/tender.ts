import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasOneGetAssociationMixin,
  HasOneSetAssociationMixin, NonAttribute, Sequelize
} from "sequelize";
import { TENDER_STATUS, TENDER_CURRENCY } from "../constants";
import { CreateTenderProperties, Tender } from "./interfaces/tender";
import { Image } from "./interfaces/image";
import { Location } from "./interfaces/location";
import { Contact } from "./interfaces/contact";
import { Company } from "./interfaces/company";
import { Tenant } from "./interfaces/tenant";
import { CompanyModel } from "./company";
import { LocationModel } from "./location";
import { ContactModel } from "./contact";
import { TenantModel } from "./tenant";
import { ImageModel } from "./image";
import type { Models } from ".";

export class TenderModel extends Model<Tender, CreateTenderProperties> implements Tender {
  public id!: number;

  public type!: string;

  public number!: string | null;

  public status!: TENDER_STATUS;

  public fee!: number | null;

  public returned!: boolean;

  public vatKey!: string;

  public currency!: TENDER_CURRENCY;

  public surcharge!: number | null;

  public discount!: number | null;

  public validTo!: Date | null;

  public dueDate!: Date | null;

  public openDate!: Date | null;

  public startDate!: Date | null;

  public notes!: string | null;

  public inquiry!: string | null;

  public survey!: string | null;

  public locationDescription!: string | null;;

  public toolRequirements!: string | null;

  public otherComment!: string | null;

  public customerId!: ForeignKey<Company["id"]>;

  public customer?: NonAttribute<Company>;

  public setCustomer!: HasOneSetAssociationMixin<CompanyModel, number>;

  public getCustomer!: HasOneGetAssociationMixin<CompanyModel>;

  public contractorId!: ForeignKey<Company["id"]>;

  public contractor?: NonAttribute<Company>;

  public setContractor!: HasOneSetAssociationMixin<CompanyModel, number>;

  public getContractor!: HasOneGetAssociationMixin<CompanyModel>;

  public locationId!: ForeignKey<Location["id"]>;

  public location?: NonAttribute<Location>;

  public setLocation!: HasOneSetAssociationMixin<LocationModel, number>;

  public getLocation!: HasOneGetAssociationMixin<LocationModel>;

  public contactId!: ForeignKey<Contact["id"]>;

  public contact?: NonAttribute<Contact>;

  public setContact!: HasOneSetAssociationMixin<ContactModel, number>;

  public getContact!: HasOneGetAssociationMixin<ContactModel>;

  public getImages!: HasManyGetAssociationsMixin<ImageModel[]>;

  public createImage!: HasManyCreateAssociationMixin<ImageModel>;

  declare images?: NonAttribute<Image[]>;

  declare imageIds?: ForeignKey<Image["id"][]>;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    images: Association<TenderModel, ImageModel>,
    tenant: Association<TenderModel, TenantModel>,
    customer: Association<TenderModel, CompanyModel>,
    contractor: Association<TenderModel, CompanyModel>,
    location: Association<TenderModel, LocationModel>,
    contact: Association<TenderModel, ContactModel>
  };
};

export const TenderFactory = (sequelize: Sequelize): typeof TenderModel => {
  TenderModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: TENDER_STATUS.INQUIRY
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    fee: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null
    },
    returned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    vatKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    surcharge: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null
    },
    discount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    openDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    inquiry: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    survey: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    locationDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    toolRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    otherComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    contractorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false
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
  }, {
    sequelize,
    tableName: "tenders",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  TenderModel.associate = (models) => {
    TenderModel.hasMany(models.Image, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "tender"
      },
      as: "images"
    });

    TenderModel.hasMany(models.TenderItem, {
      foreignKey: "tenderId",
      as: "items"
    });

    TenderModel.belongsTo(models.Tenant, {
      foreignKey: "tenantId",
      as: "tenant"
    });

    TenderModel.belongsTo(models.Company, {
      foreignKey: "customerId",
      as: "customer"
    });

    TenderModel.belongsTo(models.Company, {
      foreignKey: "contractorId",
      as: "contractor"
    });

    TenderModel.belongsTo(models.Location, {
      foreignKey: "locationId",
      as: "location"
    });

    TenderModel.belongsTo(models.Contact, {
      foreignKey: "contactId",
      as: "contact"
    });
  };

  return TenderModel;
};
