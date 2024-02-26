import type { Permission } from "./permission";
import type { Tenant } from "./tenant";

export interface Role {
  id: number
  name: string
  permissions?: Permission[]
  tenant?: Tenant
  tenantId?: number | null
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateRoleProperties = Omit<Role, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;

export interface SetRolePermissionsProperties {
  id: number
  permissions: Array<{ id: number }>
};
