export interface Permission {
  id: number
  name: string
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreatePermissionProperties = Omit<Permission, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;