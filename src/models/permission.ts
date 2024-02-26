import { Model, DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";
import type { CreatePermissionProperties, Permission } from "./interfaces/permission";
import type { Models } from ".";

export class PermissionModel extends Model<Permission, CreatePermissionProperties> implements Permission {
  public id!: number;

  public name!: string;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;
}

export const PermissionFactory = (sequelize: Sequelize): typeof PermissionModel => {
  PermissionModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      createdOn: {
        type: DataTypes.DATE,
      },
      updatedOn: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true,
      }
    },
    {
      sequelize,
      tableName: "permissions",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      underscored: true
    });

  PermissionModel.associate = (models) => {
    PermissionModel.belongsToMany(models.Role, {
      foreignKey: "permission_id",
      through: "role_permissions"
    });
  };

  return PermissionModel;
};
