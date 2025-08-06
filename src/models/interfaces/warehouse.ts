import { Tenant } from "./tenant"
import { User } from "./user"

export interface Warehouse {
  id: number
  //
  name: string
  country: string
  region?: string | null
  city: string
  address: string
  zipCode: string
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
}

export type CreateWarehouseProperties = Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>;