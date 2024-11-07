import type { User } from "./user"

export interface RefreshToken {
  id: number
  //
  token: string
  //
  userId?: User["id"] | null
  user?: User
  //
  createdOn?: Date
  updatedOn?: Date | null
};

export type CreateRefreshTokenProperties = Omit<RefreshToken, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
