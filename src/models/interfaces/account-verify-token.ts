import type { User } from "./user"

export interface AccountVerifyToken {
  id: number
  //
  userId?: User["id"] | null
  user?: User | null
  //
  token: string
  //
  createdOn?: Date
  updatedOn?: Date | null
  deletedOn?: Date | null
}

export type CreateAccountVerifyTokenProperties = Omit<AccountVerifyToken, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
