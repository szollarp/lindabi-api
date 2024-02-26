import { Model, DataTypes, type Sequelize, type NonAttribute, type ForeignKey } from "sequelize";
import type { CreateForgottenPasswordTokenProperties, ForgottenPasswordToken } from "./interfaces/forgotten-password-token";
import type { User } from "./interfaces/user";
import type { Models } from ".";

export class ForgottenPasswordTokenModel extends Model<ForgottenPasswordToken, CreateForgottenPasswordTokenProperties> implements ForgottenPasswordToken {
  public id!: number;

  public token!: string;

  public readonly createdOn!: Date;

  public readonly expiredOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly deletedOn!: Date | null;

  declare user?: NonAttribute<User>;

  declare userId?: ForeignKey<User["id"]>;

  public static associate: (models: Models) => void;
}

export const ForgottenPasswordTokenFactory = (sequelize: Sequelize): typeof ForgottenPasswordTokenModel => {
  ForgottenPasswordTokenModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      createdOn: {
        type: DataTypes.DATE
      },
      expiredOn: {
        type: DataTypes.DATE
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
      tableName: "forgotten_password_tokens",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      deletedAt: "deleted_on",
      paranoid: true,
      underscored: true
    }
  );

  ForgottenPasswordTokenModel.associate = (models) => {
    ForgottenPasswordTokenModel.belongsTo(models.User, {
      foreignKey: "user_id", as: "user"
    });
  };

  return ForgottenPasswordTokenModel;
};
