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
  SUPPLIER = "supplier",
};

export enum CONTACT_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
};

export enum TENDER_STATUS {
  INQUIRY = "inquiry",
  PENDING = "pending",
  AWAITING_OFFER = "awaiting offer",
  AWAITING_APPROVAL = "awaiting approval",
  FINALIZED = "final",
  SENT = "sent",
  ORDERED = "ordered",
  INVALID = "invalid",
  UNDER_SURVEY = "under survey"
};

export enum TENDER_CURRENCY {
  HUF = "huf",
  EUR = "eur",
  USD = "usd"
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
  ACCOUNT_VERIFY: "auth/verify-account",
  SET_PASSWORD: "auth/reset-password",
  LOGIN: "auth/login"
};

export const JOURNEY_PROPERTY_MAP = {
  "type": "Type of the Work",
  "status": "Status",
  "fee": "Survey fee",
  "returned": "Returned",
  "customerId": "Customer",
  "locationId": "Location",
  "contactId": "Contact",
  "contractorId": "Contractor",
  "vatKey": "VAT",
  "surcharge": "Surcharge",
  "currency": "Currency",
  "discount": "Discount",
  "validTo": "Validity at",
  "dueDate": "Offer deadline",
  "openDate": "Issue date",
  "startDate": "Expected start of work",
  "notes": "Notes",
  "survey": "Survey images",
  "plan": "Plan images",
  "pdf": "Pdf documents",
  "other": "Other documents",
  "inquiry": "Inquiry",
  "toolRequirements": "Tool requirement",
  "locationDescription": "Location description",
  "otherComment": "Other comment",
};

export const JOURNEY_DATE_PROPERTIES = ["dueDate", "openDate", "startDate", "validTo"];