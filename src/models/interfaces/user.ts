import type { USER_STATUS } from "../../constants";
import type { AccountVerifyToken } from "./account-verify-token";
import type { ForgottenPasswordToken } from "./forgotten-password-token";
import type { ProfilePicture } from "./profile-picture";
import type { Role } from "./role";
import type { TwoFactorSession } from "./two-factor-session";
import type { TwoFactorAuthentication } from "./two-factor-authentication";
import type { Tenant } from "./tenant";

export interface User {
  id: number
  email: string
  name: string
  password?: string
  phoneNumber: string | null
  salt?: string
  status?: "active" | "inactive" | "disabled" | "pending"
  enableTwoFactor?: boolean
  country?: string | null
  region?: string | null
  city?: string | null
  address?: string | null
  zipCode?: string | null
  createdOn?: Date
  updatedOn?: Date | null
  deletedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
  deletedBy?: number | null
  accountVerifyToken?: AccountVerifyToken
  accountVerifyTokenId?: number | null
  forgottenPasswordToken?: ForgottenPasswordToken
  forgottenPasswordTokenId?: number | null
  profilePicture?: ProfilePicture
  profilePictureId?: number | null
  twoFactorSession?: TwoFactorSession
  twoFactorSessionId?: number | null
  twoFactorAuthentication?: TwoFactorAuthentication
  twoFactorAuthenticationId?: number | null
  role?: Role
  roleId?: number | null
  tenant?: Tenant
  tenantId?: number | null
  lastLoggedIn?: Date | null
};

export type CreateUserProperties = Omit<User, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn" | "deletedOn" | "deletedBy" | "accountVerifyToken" | "forgottenPasswordToken">;

export type UpdateUserProperties = Omit<User, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn" | "deletedOn" | "deletedBy" | "email" | "password" | "accountVerifyToken" | "forgottenPasswordToken" | "lastLoggedIn">;

export interface UpdatePasswordProperties {
  password: string
  newPassword: string
};

export interface SetupTwoFactorAuthenticationProperties {
  enableTwoFactor: boolean
};
