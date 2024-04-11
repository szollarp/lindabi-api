export interface TwoFactorSession {
  id: number
  userId: number
  token: string
  createdOn?: Date
  updatedOn?: Date | null
};

export type CreateTwoFactorSessionProperties = Omit<TwoFactorSession, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
