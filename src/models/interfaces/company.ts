import type { COMPANY_STATUS, COMPANY_TYPE } from "../../constants";
import type { Contact } from "./contact";
import type { Document } from "./document";
import type { User } from "./user";

export interface Company {
  id: number
  //
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
  //
  documentIds?: Document["id"][] | null
  documents?: Document[]
  //
  contactIds?: Contact["id"][] | null
  contacts?: Contact[]
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateCompanyProperties = Omit<Company, "id" | "createdOn" | "updatedBy" | "updatedOn">;