import type { LOCATION_STATUS } from "../../constants";
import type { Tenant } from "./tenant";
import type { User } from "./user";

export interface Location {
  id: number
  //
  taxNumber?: string | null
  name: string
  country: string
  region?: string | null
  city: string
  address: string
  zipCode: string
  status: LOCATION_STATUS.ACTIVE | LOCATION_STATUS.INACTIVE
  notes?: string | null
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateLocationProperties = Omit<Location, "id" | "createdOn" | "updatedBy" | "updatedOn">;
