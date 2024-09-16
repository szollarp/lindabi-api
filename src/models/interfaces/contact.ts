import type { CONTACT_STATUS } from "../../constants"
import type { User } from "./user"

export interface Contact {
  id: number
  userId?: number | null
  name: string
  email?: string | null
  phoneNumber?: string | null
  status: CONTACT_STATUS.ACTIVE | CONTACT_STATUS.INACTIVE
  notes?: string | null
  user?: User | null
  tenantId?: number | null
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateContactProperties = Omit<Contact, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;

export type CreateCompanyContactProperties = Omit<Contact, "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;