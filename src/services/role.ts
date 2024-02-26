import { NotAcceptable } from "http-errors";
import type { Role, SetRolePermissionsProperties } from "../models/interfaces/role";
import type { Context } from "../types";
import type { Permission } from "../models/interfaces/permission";

export interface RoleService {
  getRoles: (context: Context, tenantId: number) => Promise<Array<Partial<Role>>>
  getPermissions: (context: Context, tenantId: number) => Promise<Array<Partial<Permission>>>
  updatePermissions: (context: Context, tenantId: number, data: SetRolePermissionsProperties[]) => Promise<Array<Partial<Role>>>
}

export const roleService = (): RoleService => {
  const getRoles = async (context: Context, tenantId: number): Promise<Array<Partial<Role>>> => {
    try {
      const roles = await context.models.Role.findAll({
        attributes: ["id", "name"],
        where: { tenantId },
        order: [["id", "ASC"]],
        include: [
          {
            model: context.models.Permission,
            attributes: ["id"],
            through: { attributes: [] },
            as: "permissions"
          }
        ]
      });

      return roles;
    } catch (error) {
      context.logger.error(error);
      throw NotAcceptable("ERROR_ROLE_FETCH");
    }
  };

  const getPermissions = async (context: Context, tenantId: number): Promise<Array<Partial<Permission>>> => {
    try {
      const permissions = await context.models.Permission.findAll({
        attributes: ["id", "name"],
        order: [["id", "ASC"]]
      });

      return permissions;
    } catch (error) {
      context.logger.error(error);
      throw NotAcceptable("ERROR_ROLE_FETCH");
    }
  };

  const updatePermissions = async (context: Context, tenantId: number, data: SetRolePermissionsProperties[]): Promise<Array<Partial<Permission>>> => {
    try {
      const roles = await context.models.Role.findAll({
        attributes: ["id"],
        where: { tenantId }
      });

      for (const role of roles) {
        const permissions = data.find((value) => value.id === role.id)?.permissions.map((permission) => permission.id);
        await role.setPermissions(permissions);
      }

      return data;
    } catch (error) {
      context.logger.error(error);
      throw NotAcceptable("ERROR_ROLE_FETCH");
    }
  };

  return { getRoles, getPermissions, updatePermissions };
};