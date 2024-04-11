import { Model, DataTypes } from "sequelize";
import type { ForeignKey, NonAttribute, Sequelize } from "sequelize";
import type { Models } from ".";
import type { CreateLocationProperties, Location } from "./interfaces/location";
import type { Tenant } from "./interfaces/tenant";
import { LOCATION_STATUS } from "../constants";

export class LocationModel extends Model<Location, CreateLocationProperties> implements Location {
  public id!: number;

  public name!: string;

  public status!: LOCATION_STATUS.ACTIVE | LOCATION_STATUS.INACTIVE;

  public country!: string;

  public region!: string | null;

  public city!: string;

  public zipCode!: string;

  public address!: string;

  public notes?: string | null;

  declare tenant: NonAttribute<Tenant>;

  declare tenantId: ForeignKey<Tenant["id"]>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;
};

export const LocationFactory = (sequelize: Sequelize): typeof LocationModel => {
  LocationModel.init(
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
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: LOCATION_STATUS.ACTIVE
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
      tableName: "locations",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true
    });

  LocationModel.associate = (models) => {
    LocationModel.belongsToMany(models.Company, {
      through: "company_locations"
    });
  };

  return LocationModel;
};
