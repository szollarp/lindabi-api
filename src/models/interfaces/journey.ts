export interface Journey {
  id: number
  activity?: string | null
  property?: string | null
  existed?: string | null
  updated?: string | null
  notes?: Record<string, unknown> | null
  ownerType: string
  ownerId: number
  username: string
  createdOn?: Date
  createdBy?: number
};

export type CreateJourneyProperties = Omit<Journey, "id" | "createdOn" | "updatedBy" | "updatedOn">;
