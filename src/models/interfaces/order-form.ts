import { ORDER_FORM_STATUS } from "../../constants"
import { Contact } from "./contact"
import { Project } from "./project"
import { User } from "./user"

export interface OrderForm {
  id: number
  number: string
  amount: number
  status?: ORDER_FORM_STATUS
  //
  employeeId: number
  employee?: User
  managerId: number
  manager?: Contact
  projectId: number
  project?: Project
  //
  issueDate: Date
  siteHandoverDate: Date
  deadlineDate: Date
  //
  financialSchedule?: string | null
  description?: string | null
  otherNotes?: string | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
  //
  approveCode: string
  approvedOn?: Date | null
};

export type CreateOrderFormProperties = Omit<OrderForm, "id" | "number" | "status" | "createdOn" | "updatedOn" | "approvedOn" | "approveCode">;

export type ApproveOrderFormProperties = {
  approveCode: string
};