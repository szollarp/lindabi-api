import type { Permission } from "./permission";
import type { Tenant } from "./tenant";
import type { User } from "./user";

export interface Role {
  id: number
  //
  name: string
  //
  permissionIds?: Permission["id"][]
  permissions?: Permission[]
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateRoleProperties = Omit<Role, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;

export interface SetRolePermissionsProperties {
  id: number
  permissions: Array<{ id: number }>
};
