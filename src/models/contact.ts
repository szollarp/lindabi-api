import { Model, DataTypes } from "sequelize";
import type { ForeignKey, NonAttribute, Sequelize } from "sequelize";
import type { CreateContactProperties, Contact } from "./interfaces/contact";
import type { Tenant } from "./interfaces/tenant";
import { CONTACT_STATUS } from "../constants";
import type { Models } from ".";

export class ContactModel extends Model<Contact, CreateContactProperties> implements Contact {
  public id!: number;

  public name!: string;

  public email!: string;

  public phoneNumber!: string;

  public status!: CONTACT_STATUS.ACTIVE | CONTACT_STATUS.INACTIVE;

  public notes!: string | null;

  declare tenant: NonAttribute<Tenant>;

  declare tenantId: ForeignKey<Tenant["id"]>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;
};

export const ContactFactory = (sequelize: Sequelize): typeof ContactModel => {
  ContactModel.init(
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
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: CONTACT_STATUS.ACTIVE
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
      tableName: "contacts",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true
    });

  ContactModel.associate = (models) => {
    ContactModel.belongsToMany(models.Company, {
      through: "company_contacts"
    });
  };

  return ContactModel;
};
