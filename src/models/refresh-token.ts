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

  declare expiresAt: Date | null;

  declare platform: string | null;
  declare osVersion: string | null;
  declare appVersion: string | null;
  declare deviceModel: string | null;
  declare lastActivity: Date | null;
  declare ipAddress: string | null;

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
        type: DataTypes.TEXT,
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
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: "expires_at"
      },
      platform: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null
      },
      osVersion: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null,
        field: "os_version"
      },
      appVersion: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
        field: "app_version"
      },
      deviceModel: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        field: "device_model"
      },
      lastActivity: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: "last_activity"
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        defaultValue: null,
        field: "ip_address"
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
