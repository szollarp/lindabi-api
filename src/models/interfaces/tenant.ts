import type { TENANT_STATUS } from "../../constants";
import type { Image } from "./image";

export interface Tenant {
  id: number
  name: string
  email: string
  country: string
  region?: string | null
  city: string
  address: string
  zipCode: string
  status: TENANT_STATUS.ACTIVE | TENANT_STATUS.INACTIVE
  taxNumber: string
  registrationNumber: string
  bankAccount?: string | null
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
  images?: Image[]
};

export type CreateTenantProperties = Omit<Tenant, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;