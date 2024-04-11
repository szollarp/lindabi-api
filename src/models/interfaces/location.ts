import type { LOCATION_STATUS } from "../../constants";

export interface Location {
  id: number
  name: string
  country: string
  region?: string | null
  city: string
  address: string
  zipCode: string
  status: LOCATION_STATUS.ACTIVE | LOCATION_STATUS.INACTIVE
  notes?: string | null
  tenantId?: number | null
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateLocationProperties = Omit<Location, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
