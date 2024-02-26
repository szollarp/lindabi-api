import type { CONTACT_STATUS } from "../../constants"

export interface Contact {
  id: number
  name: string
  email?: string | null
  phoneNumber?: string | null
  status: CONTACT_STATUS.ACTIVE | CONTACT_STATUS.INACTIVE
  notes?: string | null
  tenantId: number
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateContactProperties = Omit<Contact, "id" | "tenantId" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;