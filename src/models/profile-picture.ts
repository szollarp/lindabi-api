import { Model, DataTypes, type Sequelize } from "sequelize";
import type { CreateProfilePictureProperties, ProfilePicture } from "./interfaces/profile-picture";
import type { Models } from ".";

export class ProfilePictureModel extends Model<ProfilePicture, CreateProfilePictureProperties> implements ProfilePicture {
  public id!: number;

  public image!: string;

  public mimeType!: string;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public ownerId?: number | null;

  public ownerType?: "user" | "tenant" | "contact" | "procurer" | "executor" | null;

  public static associate: (models: Models) => void;
}

export const ProfilePictureFactory = (sequelize: Sequelize): typeof ProfilePictureModel => {
  ProfilePictureModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      image: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
        get() {
          const image = this.getDataValue("image");
          return image !== null ? Buffer.from(image).toString() : null;
        }
      },
      mimeType: {
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
      tableName: "profile_pictures",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      paranoid: false,
      underscored: true
    }
  );

  ProfilePictureModel.associate = (models) => {
    ProfilePictureModel.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "user",
      scope: {
        ownerType: "user"
      }
    });

    ProfilePictureModel.belongsTo(models.Tenant, {
      foreignKey: "owner_id",
      as: "tenant",
      scope: {
        ownerType: "tenant"
      }
    });

    ProfilePictureModel.belongsTo(models.Company, {
      foreignKey: "owner_id",
      as: "company",
      scope: {
        ownerType: "company"
      }
    });
  };

  return ProfilePictureModel;
};
