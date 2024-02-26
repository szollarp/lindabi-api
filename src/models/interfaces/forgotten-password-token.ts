export interface ForgottenPasswordToken {
  id: number
  userId?: number | null
  token: string
  createdOn?: Date
  expiredOn?: Date
  updatedOn?: Date | null
  deletedOn?: Date | null
};

export type CreateForgottenPasswordTokenProperties = Omit<ForgottenPasswordToken, "id" | "userId" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
