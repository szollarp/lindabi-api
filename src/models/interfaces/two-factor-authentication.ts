import type { GeneratedSecret } from "speakeasy";

export interface TwoFactorAuthentication {
  id: number
  userId: number
  secret: GeneratedSecret | Record<string, never> | null
  createdOn?: Date
  updatedOn?: Date | null
};

export type CreateTwoFactorAuthenticationProperties = Omit<TwoFactorAuthentication, "id" | "createdOn" | "updatedOn">;
