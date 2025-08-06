import { Tenant } from "./tenant"
import { User } from "./user"

export interface Item {
  id: number
  //
  name: string
  manufacturer?: string | null
  vatKey: string
  description?: string | null
  category?: string | null
  netAmount?: number | null
  unit?: string | null
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
}

export type CreateItemProperties = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;