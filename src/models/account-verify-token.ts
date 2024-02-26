import { Model, DataTypes, type Sequelize, type ForeignKey, type NonAttribute } from "sequelize";
import type { CreateAccountVerifyTokenProperties, AccountVerifyToken } from "./interfaces/account-verify-token";
import type { User } from "./interfaces/user";
import type { Models } from ".";

export class AccountVerifyTokenModel extends Model<AccountVerifyToken, CreateAccountVerifyTokenProperties> implements AccountVerifyToken {
  public id!: number;

  public token!: string;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly deletedOn!: Date | null;

  declare user?: NonAttribute<User>;

  declare userId?: ForeignKey<User["id"]>;

  public static associate: (models: Models) => void;
}

export const AccountVerifyTokenFactory = (sequelize: Sequelize): typeof AccountVerifyTokenModel => {
  AccountVerifyTokenModel.init(
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
      tableName: "account_verify_tokens",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      deletedAt: "deleted_on",
      paranoid: true,
      underscored: true
    }
  );

  AccountVerifyTokenModel.associate = (models) => {
    AccountVerifyTokenModel.belongsTo(models.User, {
      foreignKey: "user_id", as: "user"
    });
  };

  return AccountVerifyTokenModel;
};
