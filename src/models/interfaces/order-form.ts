import type { ORDER_FORM_STATUS } from "../../constants"
import type { Contact } from "./contact"
import type { Project } from "./project"
import type { User } from "./user"

export interface OrderForm {
  id: number
  //
  number: string
  amount: number
  status?: ORDER_FORM_STATUS
  issueDate: Date
  siteHandoverDate: Date
  deadlineDate: Date
  financialSchedule?: string | null
  description?: string | null
  otherNotes?: string | null
  approveCode: string
  approvedOn?: Date | null
  //
  employeeId: User["id"]
  employee?: User
  //
  managerId: Contact["id"]
  manager?: Contact
  //
  projectId: Project["id"]
  project?: Project
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateOrderFormProperties = Omit<OrderForm, "id" | "number" | "status" | "createdOn" | "updatedOn" | "approvedOn" | "approveCode">;

export type ApproveOrderFormProperties = {
  approveCode: string
};