import { Model, DataTypes, type Sequelize } from "sequelize";
import { CreateImageProperties, Image } from "./interfaces/image";
import type { Models } from ".";

export class ImageModel extends Model<Image, CreateImageProperties> implements Image {
  public id!: number;

  public type!: "logo" | "stamp" | "signature" | "avatar";

  public image!: string;

  public mimeType!: string;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public ownerId?: number | null;

  public ownerType?: "user" | "tenant" | "contact" | "company" | null;

  public static associate: (models: Models) => void;
}

export const ImageFactory = (sequelize: Sequelize): typeof ImageModel => {
  ImageModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
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
      tableName: "images",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      paranoid: false,
      underscored: true
    }
  );

  ImageModel.associate = (models) => {
    ImageModel.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "user",
      scope: {
        ownerType: "user"
      }
    });

    ImageModel.belongsTo(models.Tenant, {
      foreignKey: "owner_id",
      as: "tenant",
      scope: {
        ownerType: "tenant"
      }
    });

    ImageModel.belongsTo(models.Company, {
      foreignKey: "owner_id",
      as: "company",
      scope: {
        ownerType: "company"
      }
    });
  };

  return ImageModel;
};
