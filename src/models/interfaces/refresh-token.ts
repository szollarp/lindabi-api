export interface RefreshToken {
  id: number
  userId?: number | null
  token: string
  createdOn?: Date
  updatedOn?: Date | null
};

export type CreateRefreshTokenProperties = Omit<RefreshToken, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
