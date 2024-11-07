import type { Tenant } from "./tenant"
import type { User } from "./user"

export interface Subscription {
  id: number
  //
  name: string
  dateStart: Date
  dateEnd: Date
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateSubscriptionProperties = Omit<Subscription, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;