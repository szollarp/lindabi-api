import { Model, DataTypes, type Sequelize, type NonAttribute, type ForeignKey, type HasOneGetAssociationMixin } from "sequelize";
import type { CreateTwoFactorSessionProperties, TwoFactorSession } from "./interfaces/two-factor-session";
import type { User } from "./interfaces/user";
import type { Models } from ".";

export class TwoFactorSessionModel extends Model<TwoFactorSession, CreateTwoFactorSessionProperties> implements TwoFactorSession {
  public id!: number;

  public token!: string;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date;

  declare user?: NonAttribute<User>;

  declare userId?: ForeignKey<User["id"]>;

  public getUser!: HasOneGetAssociationMixin<User>;

  public static associate: (models: Models) => void;
}

export const TwoFactorSessionModelFactory = (sequelize: Sequelize): typeof TwoFactorSessionModel => {
  TwoFactorSessionModel.init(
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
      }
    },
    {
      sequelize,
      tableName: "two_factor_sessions",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true,
      paranoid: false
    }
  );

  TwoFactorSessionModel.associate = (models) => {
    TwoFactorSessionModel.belongsTo(models.User, {
      foreignKey: "user_id", as: "user"
    });
  };

  return TwoFactorSessionModel;
};
