export interface Subscription {
  id: number
  tenantId?: number | null
  name: string
  dateStart: Date
  dateEnd: Date
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateSubscriptionProperties = Omit<Subscription, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;