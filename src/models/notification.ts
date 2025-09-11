import { Model, DataTypes } from "sequelize";
import type {
  Sequelize, Association, HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin, NonAttribute,
  ForeignKey, HasOneSetAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCreateAssociationMixin
} from "sequelize";
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS, NOTIFICATION_PRIORITY } from "../constants";
import type { Notification, CreateNotificationProperties } from "./interfaces/notification";
import type { User } from "./interfaces/user";
import type { UserModel } from "./user";
import type { Models } from ".";

export class NotificationModel extends Model<Notification, CreateNotificationProperties> implements Notification {
  public id!: number;

  public title!: string;

  public message!: string;

  public type!: NOTIFICATION_TYPE;

  public status!: NOTIFICATION_STATUS;

  public priority!: NOTIFICATION_PRIORITY;

  public data?: Record<string, unknown> | null;

  public readAt?: Date | null;

  public archivedAt?: Date | null;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly deletedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public readonly deletedBy!: number | null;

  declare user?: NonAttribute<User>;

  declare userId?: ForeignKey<User["id"]>;

  public static associate: (models: Models) => void;

  public getUser!: HasOneGetAssociationMixin<UserModel>;

  public setUser!: HasOneSetAssociationMixin<UserModel, number>;

  public static associations: {
    user: Association<NotificationModel, UserModel>
  };
}

export const NotificationFactory = (sequelize: Sequelize): typeof NotificationModel => {
  NotificationModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPE)),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(...Object.values(NOTIFICATION_STATUS)),
        allowNull: false,
        defaultValue: NOTIFICATION_STATUS.UNREAD
      },
      priority: {
        type: DataTypes.ENUM(...Object.values(NOTIFICATION_PRIORITY)),
        allowNull: false,
        defaultValue: NOTIFICATION_PRIORITY.MEDIUM
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      archivedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      deletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      createdOn: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedOn: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      },
      deletedOn: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      }
    },
    {
      sequelize,
      tableName: "notifications",
      timestamps: true,
      createdAt: "createdOn",
      updatedAt: "updatedOn",
      deletedAt: "deletedOn",
      paranoid: true,
      underscored: true
    }
  );

  NotificationModel.associate = (models) => {
    NotificationModel.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user"
    });
  };

  return NotificationModel;
};
