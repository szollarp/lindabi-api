import { Model, DataTypes } from "sequelize";
import type {
  Sequelize, Association, HasManyGetAssociationsMixin, HasManyAddAssociationMixin,
  HasManyRemoveAssociationMixin, HasManySetAssociationsMixin, NonAttribute, ForeignKey
} from "sequelize";
import type { PermissionModel } from "./permission";
import type { CreateRoleProperties, Role } from "./interfaces/role";
import type { Tenant } from "./interfaces/tenant";
import type { Models } from ".";

export class RoleModel extends Model<Role, CreateRoleProperties> implements Role {
  public id!: number;

  public name!: string;

  public getPermissions!: HasManyGetAssociationsMixin<PermissionModel>;

  public addPermission!: HasManyAddAssociationMixin<PermissionModel, number>;

  public addPermissions!: HasManyAddAssociationMixin<PermissionModel[], number[]>;

  public removePermission!: HasManyRemoveAssociationMixin<PermissionModel, number>;

  public setPermissions!: HasManySetAssociationsMixin<PermissionModel[], number[]>;

  declare tenant?: NonAttribute<Tenant>;

  declare tenantId?: ForeignKey<Tenant["id"]>;

  public readonly permissionIds?: number[];

  public readonly permissions?: PermissionModel[];

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associations: {
    permissions: Association<RoleModel, PermissionModel>
  };

  public static associate: (models: Models) => void;
}

export const RoleFactory = (sequelize: Sequelize): typeof RoleModel => {
  RoleModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
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
      tableName: "roles",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      paranoid: false,
      underscored: true
    }
  );

  RoleModel.associate = (models) => {
    RoleModel.belongsToMany(models.Permission, {
      foreignKey: "role_id",
      through: "role_permissions",
      as: "permissions"
    });

    RoleModel.hasMany(models.User, {
      foreignKey: "role_id",
      as: "users"
    });

    RoleModel.belongsTo(models.Tenant, {
      foreignKey: "tenant_id", as: "tenant"
    });
  };

  return RoleModel;
};
