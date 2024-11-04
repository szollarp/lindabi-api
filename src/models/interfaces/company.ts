import type { COMPANY_STATUS, COMPANY_TYPE } from "../../constants";
import { Contact } from "./contact";
import { type Document } from "./document";

export interface Company {
  id: number
  name: string
  ceo?: string | null
  email?: string | null
  country: string
  region?: string | null
  city: string
  address: string
  zipCode: string
  status: COMPANY_STATUS.ACTIVE | COMPANY_STATUS.INACTIVE
  type: COMPANY_TYPE.CONTRACTOR | COMPANY_TYPE.CUSTOMER | COMPANY_TYPE.SUPPLIER
  default?: boolean | null
  taxNumber?: string | null
  registrationNumber?: string | null
  bankAccount?: string | null
  prefix?: string | null
  offerNum?: string | null
  tenantId?: number | null
  notes?: string | null
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
  documents?: Document[]
  contacts?: Contact[]
};

export type CreateCompanyProperties = Omit<Company, "id" | "createdOn" | "updatedBy" | "updatedOn">;