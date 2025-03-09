import type { USER_STATUS } from "../../constants";
import type { AccountVerifyToken } from "./account-verify-token";
import type { ForgottenPasswordToken } from "./forgotten-password-token";
import type { Role } from "./role";
import type { TwoFactorSession } from "./two-factor-session";
import type { TwoFactorAuthentication } from "./two-factor-authentication";
import type { Tenant } from "./tenant";
import type { Document } from "./document";
import type { Salary } from "./salary";
import type { Contact } from "./contact";
import { Execution } from "./execution";
import { Invoice } from "./invoice";
import { Project } from "./project";

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
  //
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
  lastLoggedIn?: Date | null
  notifications?: Notifications
  entity?: string;
  inSchedule?: boolean;
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
  properties?: Record<string, unknown>;
  billing?: UserBilling | {};
  //
  salaryIds?: Salary["id"][] | null
  salaries?: Salary[];
  //
  executionIds?: Execution["id"][] | null
  executions?: Execution[];
  //
  invoiceIds?: Invoice["id"][] | null
  invoices?: Invoice[];
  //
  accountVerifyTokenId?: AccountVerifyToken["id"] | null
  accountVerifyToken?: AccountVerifyToken
  //
  forgottenPasswordTokenId?: ForgottenPasswordToken["id"] | null
  forgottenPasswordToken?: ForgottenPasswordToken
  //
  twoFactorSessionId?: TwoFactorSession["id"] | null
  twoFactorSession?: TwoFactorSession
  //
  twoFactorAuthenticationId?: TwoFactorAuthentication["id"] | null
  twoFactorAuthentication?: TwoFactorAuthentication
  //
  roleId?: Role["id"] | null
  role?: Role
  //
  contactId?: Contact["id"] | null;
  contact?: Contact;
  //
  documentIds?: Document["id"][] | null
  documents?: Document[]
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant
  //
  createdOn?: Date
  updatedOn?: Date | null
  deletedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
  deletedBy?: User["id"] | null
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
