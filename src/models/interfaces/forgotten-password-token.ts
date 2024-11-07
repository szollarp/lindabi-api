import type { User } from "./user"

export interface ForgottenPasswordToken {
  id: number
  //
  token: string
  createdOn?: Date
  expiredOn?: Date
  //
  userId?: User["id"] | null
  user?: User | null
  //
  updatedOn?: Date | null
  deletedOn?: Date | null
};

export type CreateForgottenPasswordTokenProperties = Omit<ForgottenPasswordToken, "id" | "userId" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;
