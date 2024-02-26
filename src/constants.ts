export enum USER_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISABLED = "disabled",
  PENDING = "pending",
};

export enum TENANT_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
};

export enum LOCATION_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
};

export enum COMPANY_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
};

export enum COMPANY_TYPE {
  CUSTOMER = "customer",
  CONTRACTOR = "contractor",
};

export enum CONTACT_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
};

export const ERROR_MESSAGES = {
  USER_REGISTRATION: "Couldn't sign up a new user. Please check your information and try again.",
  LOGIN_FAILED: "Login failed: User with provided email or password not found or not active.",
  VERIFY_TOKEN_INVALID: "Account verification failed: No user associated with this verification token.",
  VERIFY_TOKEN_USER_NOT_FOUND: "Account verification failed: No user associated with this verification token.",
  VERIFY_TOKEN_2FA_NOT_FOUND: "Account verification failed: Two-factor authentication details not found.",
  VERIFY_TOKEN_INVALID_OTP: "Account verification failed: The provided OTP token is invalid."
};

export const WEBSITE_ENDPOINTS = {
  ACCOUNT_VERIFY: "/auth/verify-account"
};