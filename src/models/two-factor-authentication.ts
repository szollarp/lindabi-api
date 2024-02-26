import { Model, DataTypes, type Sequelize, type NonAttribute, type ForeignKey, type HasOneGetAssociationMixin } from "sequelize";
import type { GeneratedSecret } from "speakeasy";
import type { CreateTwoFactorAuthenticationProperties, TwoFactorAuthentication } from "./interfaces/two-factor-authentication";
import type { User } from "./interfaces/user";
import type { Models } from ".";

export class TwoFactorAuthenticationModel extends Model<TwoFactorAuthentication, CreateTwoFactorAuthenticationProperties> implements TwoFactorAuthentication {
  public id!: number;

  public secret!: GeneratedSecret | Record<string, never> | null;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date;

  declare user?: NonAttribute<User>;

  declare userId?: ForeignKey<User["id"]>;

  public getUser!: HasOneGetAssociationMixin<User>;

  public static associate: (models: Models) => void;
}

export const TwoFactorAuthenticationModelFactory = (sequelize: Sequelize): typeof TwoFactorAuthenticationModel => {
  TwoFactorAuthenticationModel.init(
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
      secret: {
        type: DataTypes.JSONB,
        defaultValue: {}
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
      tableName: "two_factor_authentications",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true,
      paranoid: false
    }
  );

  TwoFactorAuthenticationModel.associate = (models) => {
    TwoFactorAuthenticationModel.belongsTo(models.User, {
      foreignKey: "user_id", as: "user"
    });
  };

  return TwoFactorAuthenticationModel;
};
