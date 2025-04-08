import { Model, DataTypes, type Sequelize, type NonAttribute, type ForeignKey, type HasOneGetAssociationMixin } from "sequelize";
import type { RefreshToken, CreateRefreshTokenProperties } from "./interfaces/refresh-token";
import type { User } from "./interfaces/user";
import type { Models } from ".";

export class RefreshTokenModel extends Model<RefreshToken, CreateRefreshTokenProperties> implements RefreshToken {
  public id!: number;

  public token!: string;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date;

  declare user?: NonAttribute<User>;

  declare userId?: ForeignKey<User["id"]>;

  declare deviceId: string;

  public getUser!: HasOneGetAssociationMixin<User>;

  public static associate: (models: Models) => void;
}

export const RefreshTokenFactory = (sequelize: Sequelize): typeof RefreshTokenModel => {
  RefreshTokenModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      deviceId: {
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
      tableName: "refresh_tokens",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true
    }
  );

  RefreshTokenModel.associate = (models) => {
    RefreshTokenModel.belongsTo(models.User, {
      foreignKey: "user_id", as: "user"
    });
  };

  return RefreshTokenModel;
};
