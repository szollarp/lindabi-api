import { TENDER_CURRENCY, TENDER_STATUS } from "../../constants"
import type { Company } from "./company"
import type { Contact } from "./contact"
import type { Location } from "./location"
import type { Tenant } from "./tenant"
import type { TenderItem } from "./tender-item"
import type { Image } from "./image";

export interface Tender {
  id: number
  type: string
  number?: string | null
  status: TENDER_STATUS
  fee?: number | null
  returned: boolean
  vatKey: string
  currency: TENDER_CURRENCY
  surcharge?: number | null
  discount?: number | null
  validTo?: Date | null
  dueDate?: Date | null
  openDate?: Date | null
  startDate?: Date | null
  notes?: string | null
  inquiry?: string | null
  survey?: string | null
  locationDescription?: string | null
  toolRequirements?: string | null
  otherComment?: string | null
  customerId?: number | null
  customer?: Company
  contractorId?: number | null
  contractor?: Company
  locationId?: number | null
  location?: Location
  contactId?: number | null
  contact?: Contact
  tenant?: Tenant
  tenantId?: number | null
  items?: TenderItem[]
  images?: Image[]
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateTenderProperties = Omit<Tender, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;