import type { COMPANY_STATUS, COMPANY_TYPE } from "../../constants";
import type { ProfilePicture } from "./profile-picture";

export interface Company {
  id: number
  name: string
  email?: string | null
  country: string
  region?: string | null
  city: string
  address: string
  zipCode: string
  status: COMPANY_STATUS.ACTIVE | COMPANY_STATUS.INACTIVE
  type: COMPANY_TYPE.CONTRACTOR | COMPANY_TYPE.CUSTOMER
  default?: boolean | null
  taxNumber?: string | null
  registrationNumber?: string | null
  bankAccount?: string | null
  prefix?: string | null
  logo?: ProfilePicture | null
  tenantId?: number | null
  notes?: string | null
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateCompanyProperties = Omit<Company, "id" | "createdOn" | "updatedBy" | "updatedOn">;