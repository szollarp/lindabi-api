export interface TwoFactorSession {
  id: number
  userId?: number | null
  token: string
  createdOn?: Date
  updatedOn?: Date | null
};

export type CreateTwoFactorSessionProperties = Omit<TwoFactorSession, "id" | "userId" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
