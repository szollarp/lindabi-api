import type { GeneratedSecret } from "speakeasy";
import type { User } from "./user";

export interface TwoFactorAuthentication {
  id: number
  //
  userId: User["id"]
  user?: User
  //
  secret: GeneratedSecret | Record<string, never> | null
  createdOn?: Date
  updatedOn?: Date | null
};

export type CreateTwoFactorAuthenticationProperties = Omit<TwoFactorAuthentication, "id" | "createdOn" | "updatedOn">;
