import type { TENDER_CURRENCY, TENDER_STATUS } from "../../constants"
import type { Company } from "./company"
import type { Contact } from "./contact"
import type { Location } from "./location"
import type { Tenant } from "./tenant"
import type { TenderItem } from "./tender-item"
import type { Document } from "./document";
import type { User } from "./user"

export interface Tender {
  id: number
  //
  type: string
  shortName?: string | null
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
  //
  customerId?: Company["id"] | null
  customer?: Company
  //
  contractorId?: Company["id"] | null
  contractor?: Company
  //
  locationId?: Location["id"] | null
  location?: Location
  //
  contactId?: Contact["id"] | null
  contact?: Contact
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant
  //
  itemIds?: TenderItem["id"][] | null
  items?: TenderItem[]
  //
  documentIds?: Document["id"][] | null
  documents?: Document[]
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
  //
  netAmount?: number
  vatAmount?: number
  totalAmount?: number
};

export type CreateTenderProperties = Omit<Tender, "id" | "updatedBy" | "updatedOn">;