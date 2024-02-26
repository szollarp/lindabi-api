export interface AccountVerifyToken {
  id: number
  userId?: number | null
  token: string
  createdOn?: Date
  updatedOn?: Date | null
  deletedOn?: Date | null
}

export type CreateAccountVerifyTokenProperties = Omit<AccountVerifyToken, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
