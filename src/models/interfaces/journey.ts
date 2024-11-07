import type { User } from "./user"

export interface Journey {
  id: number
  //
  username: string
  activity?: string | null
  property?: string | null
  existed?: string | null
  updated?: string | null
  notes?: Record<string, unknown> | null
  ownerType: string
  ownerId: number
  //
  createdOn?: Date
  createdBy?: User["id"]
};

export type CreateJourneyProperties = Omit<Journey, "id" | "createdOn" | "updatedBy" | "updatedOn">;
