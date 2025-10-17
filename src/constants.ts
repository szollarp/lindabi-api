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
  ARCHIVED = "archived"
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
  UNDER_SURVEY = "under survey",
  ARCHIVED = "archived"
};

export enum PROJECT_STATUS {
  ORDERED = "ordered",
  READY = "ready to start",
  IN_PROGRESS = "in progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PAID = "paid",
  CLOSED = "closed",
  ARCHIVED = "archived"
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
  WITHHELD = "withheld"
};

export enum STATUS_REPORT_STATUS {
  FINE = "fine",
  INTERESTING = "interesting",
  ISSUE = "issue"
};

export enum EXECUTION_SETTLEMENT {
  ITEMIZED = "itemized",
  HOURLY = "hourly",
  DAILY = "daily",
  DISTANCE = "distance"
};

export enum EXECUTION_STATUS {
  PENDING = "pending",
  APPROVED = "approved"
};

export enum ORDER_FORM_STATUS {
  CREATED = "created",
  APPROVED = "approved"
};

export enum COMPLETION_CERTIFICATE_STATUS {
  DRAFT = "draft",
  SIGNED = "signed"
};

export enum INVOICE_PAYMENT_TYPE {
  cash = "cash",
  bank = "bank",
  card = "card"
};

export enum INVOICE_STATUS {
  CREATED = "created",
  APPROVED = "approved",
  PAYED = "payed"
};

export enum INVOICE_TYPE {
  EMPLOYEE = "employee",
  MATERIAL = "material",
  OUTBOUND = "outbound"
};

export enum FINANCIAL_SETTING_TYPE {
  SUPERVISOR_BONUS = "supervisor bonus",
  KM_RATE = "km rate",
};

export const PROJECT_COLORS = [
  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500", "#800080",
  "#00FFFF", "#FFC0CB", "#A52A2A", "#808080", "#FFFFFF", "#000000",
  "#FFD700", "#8B0000", "#008000", "#00008B", "#FF6347", "#4682B4",
  "#D2691E", "#ADFF2F", "#E6E6FA", "#FF4500", "#2E8B57", "#DAA520",
  "#D3D3D3", "#40E0D0", "#F08080", "#F5DEB3", "#7FFF00", "#DC143C",
  "#FF1493", "#696969", "#1E90FF", "#B22222", "#228B22", "#FF69B4",
  "#FFE4B5", "#8FBC8F", "#CD5C5C", "#B0C4DE", "#FA8072", "#FAFAD2",
  "#90EE90", "#778899", "#E9967A", "#AFEEEE", "#F4A460", "#D8BFD8",
  "#BDB76B", "#6B8E23", "#F0E68C", "#EE82EE", "#5F9EA0", "#F5F5DC",
  "#FFB6C1", "#BC8F8F", "#C71585", "#7B68EE", "#00CED1", "#FFEBCD",
  "#9932CC", "#FFEFD5", "#4169E1", "#FFF5EE", "#87CEFA", "#DB7093",
  "#C0C0C0", "#7CFC00", "#DEB887", "#A9A9A9", "#BA55D3", "#CD853F",
  "#B8860B", "#2F4F4F", "#9932CC", "#FF8C00", "#6A5ACD", "#00FA9A",
  "#FFDEAD", "#8A2BE2", "#3CB371", "#FFDAB9", "#8B4513", "#7B68EE",
  "#DA70D6", "#DDA0DD", "#48D1CC", "#A0522D", "#FFE4C4", "#20B2AA",
  "#708090", "#FFE4E1", "#DCDCDC", "#F0FFF0", "#F5F5F5", "#E0FFFF",
  "#FDF5E6", "#FFFACD", "#FFFAF0", "#FFF0F5", "#F8F8FF", "#EEDC82",
  "#D2B48C", "#E0FFFF", "#E9967A", "#00BFFF", "#E6E6FA", "#F5FFFA"
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

export enum NOTIFICATION_TYPE {
  USER_NEW = "user_new",
  USER_UPDATE = "user_update",
  USER_DELETE = "user_delete",
  USER_UPDATE_ROLE = "user_update_role",
  TENDER_NEW = "tender_new",
  TENDER_APPROVED = "tender_approved",
  TENDER_STATUS_CHANGE = "tender_status_change",
  TENDER_AWAITING_APPROVAL = "tender_awaiting_approval",
  CONTACT_NEW = "contact_new",
  CONTACT_UPDATE = "contact_update",
  CUSTOMER_NEW = "customer_new",
  CUSTOMER_UPDATE = "customer_update",
  CONTRACTOR_NEW = "contractor_new",
  CONTRACTOR_UPDATE = "contractor_update",
  PERMISSION_MATRIX_UPDATE = "permission_matrix_update",
  PROJECT_NEW = "project_new",
  PROJECT_UPDATE = "project_update",
  PROJECT_STATUS_CHANGE = "project_status_change",
  TASK_NEW = "task_new",
  TASK_UPDATE = "task_update",
  TASK_ASSIGNED = "task_assigned",
  TASK_COMPLETED = "task_completed",
  INVOICE_NEW = "invoice_new",
  INVOICE_APPROVED = "invoice_approved",
  INVOICE_PAID = "invoice_paid",
  EXECUTION_NEW = "execution_new",
  EXECUTION_APPROVED = "execution_approved",
  SYSTEM_MAINTENANCE = "system_maintenance",
  GENERAL = "general"
}

export enum NOTIFICATION_STATUS {
  UNREAD = "unread",
  READ = "read",
  ARCHIVED = "archived"
}

export enum NOTIFICATION_PRIORITY {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent"
}