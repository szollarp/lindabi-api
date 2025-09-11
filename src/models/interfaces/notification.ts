import type { User } from "./user";

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

export interface Notification {
  id: number
  title: string
  message: string
  type: NOTIFICATION_TYPE
  status: NOTIFICATION_STATUS
  priority: NOTIFICATION_PRIORITY
  data?: Record<string, unknown> | null
  readAt?: Date | null
  archivedAt?: Date | null

  userId?: User["id"] | null
  user?: User

  createdBy?: User["id"]
  createdOn: Date
  updatedOn?: Date | null
  deletedOn?: Date | null
  updatedBy?: User["id"] | null
  deletedBy?: User["id"] | null
}

export type CreateNotificationProperties = Omit<Notification, "id" | "createdOn" | "updatedOn" | "deletedOn" | "updatedBy" | "deletedBy" | "user">;

export type UpdateNotificationProperties = Omit<Notification, "id" | "createdOn" | "createdBy" | "updatedOn" | "deletedOn" | "deletedBy" | "user">;
