import type { User } from "./user"

export interface TwoFactorSession {
  id: number
  //
  token: string
  //
  userId: User["id"]
  user?: User
  //
  createdOn?: Date
  updatedOn?: Date | null
};

export type CreateTwoFactorSessionProperties = Omit<TwoFactorSession, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
