import type { User } from "./user"

export interface Permission {
  id: number
  //
  name: string
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreatePermissionProperties = Omit<Permission, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;