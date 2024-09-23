export enum USER_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISABLED = "disabled",
  PENDING = "pending",
};

export enum USER_TYPE {
  USER = "user",
  EMPLOYEE = "employee"
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

export enum PROJECT_STATUS {
  ORDERED = "ordered",
  READY = "ready to start",
  IN_PROGRESS = "in progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PAID = "paid",
  CLOSED = "closed"
};

export enum PROJECT_ITEM_STATUS {
  OPEN = "open",
  CLOSED = "closed"
};

export enum PROJECT_ITEM_TYPE {
  HOURLY = "hourly",
  DAILY = "daily",
  ITEMIZED = "itemized",
  DISTANCE = "distance",
};

export enum TENDER_CURRENCY {
  HUF = "huf",
  EUR = "eur",
  USD = "usd"
};

export enum PROJECT_CURRENCY {
  HUF = "huf",
  EUR = "eur",
  USD = "usd"
};

export enum MILESTONE_STATUS {
  IN_PROGRESS = "in progress",
  COMPLETE = "complete",
  TIG_ISSUED = "tig issued",
  BILLABLE = "billable",
  INVOICED = "invoiced",
  PAID = "paid",
};

export enum STATUS_REPORT_STATUS {
  FINE = "fine",
  INTERESTING = "interesting",
  ISSUE = "issue"
};

export const PROJECT_COLORS = [
  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500", "#800080",
  "#00FFFF", "#FFC0CB", "#A52A2A", "#808080", "#FFFFFF", "#000000",
  "#FFD700", "#8B0000", "#008000", "#00008B", "#FF6347", "#4682B4",
  "#D2691E", "#ADFF2F", "#E6E6FA", "#FF4500", "#2E8B57", "#DAA520",
  "#D3D3D3", "#40E0D0", "#F08080", "#F5DEB3", "#7FFF00", "#DC143C",
  "#FF1493", "#696969", "#1E90FF", "#B22222", "#228B22", "#FF69B4"
];

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