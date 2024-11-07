import type { TENANT_STATUS } from "../../constants";
import type { Document } from "./document";
import type { User } from "./user";

export interface Tenant {
  id: number
  //
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
  //
  documentIds?: Document["id"][]
  documents?: Document[]
  //
  createdBy?: User["id"]
  createdOn?: Date
  updatedBy?: User["id"] | null
  updatedOn?: Date | null
};

export type CreateTenantProperties = Omit<Tenant, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;