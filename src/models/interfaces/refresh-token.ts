import type { User } from "./user"

export interface RefreshToken {
  id: number
  //
  token: string
  //
  userId?: User["id"] | null
  user?: User
  //
  deviceId: string
  //
  expiresAt?: Date | null
  //
  platform?: string | null
  osVersion?: string | null
  appVersion?: string | null
  deviceModel?: string | null
  lastActivity?: Date | null
  ipAddress?: string | null
  //
  createdOn?: Date
  updatedOn?: Date | null
};

export type CreateRefreshTokenProperties = Omit<RefreshToken, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
