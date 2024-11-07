import type { CONTACT_STATUS } from "../../constants"
import type { Tenant } from "./tenant"
import type { User } from "./user"

export interface Contact {
  id: number
  //
  name: string
  email?: string | null
  phoneNumber?: string | null
  status: CONTACT_STATUS.ACTIVE | CONTACT_STATUS.INACTIVE
  notes?: string | null
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  userId?: User["id"] | null
  user?: User | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateContactProperties = Omit<Contact, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;

export type CreateCompanyContactProperties = Omit<Contact, "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;