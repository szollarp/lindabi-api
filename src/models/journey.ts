import { Model, DataTypes, Sequelize } from "sequelize";
import { CreateJourneyProperties, Journey } from "./interfaces/journey";
import { Models } from ".";

export class JourneyModel extends Model<Journey, CreateJourneyProperties> implements Journey {
  public id!: number;

  public activity!: string;

  public property!: string;

  public existed!: string | null;

  public updated!: string | null;

  public notes!: Record<string, never> | null;

  public username!: string;

  public ownerId!: number;

  public ownerType!: string;

  public readonly createdOn!: Date;

  public readonly createdBy!: number;

  public static associate: (models: Models) => void;
}

export const JourneyFactory = (sequelize: Sequelize): typeof JourneyModel => {
  JourneyModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      activity: {
        type: DataTypes.STRING,
        allowNull: false
      },
      property: {
        type: DataTypes.STRING,
        allowNull: true
      },
      existed: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      updated: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notes: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ownerType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      createdBy: {
        type: DataTypes.INTEGER
      },
      createdOn: {
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      tableName: "journeys",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true
    });

  JourneyModel.associate = (models) => {
    JourneyModel.belongsTo(models.Tender, {
      foreignKey: "owner_id",
      as: "tender",
      scope: {
        ownerType: "tender"
      }
    });
  };

  return JourneyModel;
};
