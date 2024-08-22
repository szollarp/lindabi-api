import type { USER_STATUS } from "../../constants";
import type { AccountVerifyToken } from "./account-verify-token";
import type { ForgottenPasswordToken } from "./forgotten-password-token";
import type { Role } from "./role";
import type { TwoFactorSession } from "./two-factor-session";
import type { TwoFactorAuthentication } from "./two-factor-authentication";
import type { Tenant } from "./tenant";
import type { Document } from "./document";
import { Salary } from "./salary";
import { Contact } from "./contact";

export interface Notifications {
  userNew: boolean
  tenderNew: boolean
  contactNew: boolean
  userDelete: boolean
  userUpdate: boolean
  customerNew: boolean
  contactUpdate: boolean
  contractorNew: boolean
  customerUpdate: boolean
  tenderApproved: boolean
  userUpdateRole: boolean
  contractorUpdate: boolean
  tenderStatusChange: boolean
  permissionMatrixUpdate: boolean
  tenderAwaitingApproval: boolean
}

export interface UserBilling {
  name: string
  country: string
  region?: string | null
  city: string
  address: string
  zipCode: string
  taxNumber?: string | null
  registrationNumber?: string | null
  bankAccount?: string | null
  notes?: string | null
};

export interface User {
  id: number
  email: string
  name: string
  password?: string
  phoneNumber: string | null
  salt?: string
  status?: USER_STATUS.ACTIVE | USER_STATUS.INACTIVE | USER_STATUS.DISABLED | USER_STATUS.PENDING
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
  twoFactorSession?: TwoFactorSession
  twoFactorSessionId?: number | null
  twoFactorAuthentication?: TwoFactorAuthentication
  twoFactorAuthenticationId?: number | null
  role?: Role
  roleId?: number | null
  tenant?: Tenant
  tenantId?: number | null
  lastLoggedIn?: Date | null
  documents?: Document[]
  notifications?: Notifications
  entity?: string;
  enableLogin?: boolean;
  identifier?: string | null;
  employeeType?: string | null;
  notes?: string | null;
  birthName?: string | null;
  motherName?: string | null;
  placeOfBirth?: string | null;
  dateOfBirth?: Date | null;
  socialSecurityNumber?: string | null;
  taxIdentificationNumber?: string | null;
  personalIdentificationNumber?: string | null;
  licensePlateNumber?: string | null;
  salaries?: Salary[];
  contact?: Contact;
  contactId?: number | null;
  properties?: Record<string, unknown>;
  billing?: UserBilling | {};
};

export type CreateUserProperties = Omit<User, "id" | "createdOn" | "updatedBy" | "updatedOn" | "deletedOn" | "deletedBy" | "accountVerifyToken" | "forgottenPasswordToken">;

export type UpdateUserProperties = Omit<User, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn" | "deletedOn" | "deletedBy" | "email" | "password" | "accountVerifyToken" | "forgottenPasswordToken" | "lastLoggedIn">;

export interface UpdatePasswordProperties {
  password: string
  newPassword: string
};

export interface SetupTwoFactorAuthenticationProperties {
  enableTwoFactor: boolean
};
