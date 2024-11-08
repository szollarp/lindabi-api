import { INVOICE_PAYMENT_TYPE, INVOICE_STATUS, INVOICE_TYPE } from "../../constants";
import { Company } from "./company";
import { Document } from "./document";
import { Milestone } from "./milestone";
import { Project } from "./project";
import { Tenant } from "./tenant";
import { User } from "./user";

export interface Invoice {
  id: number;
  type: INVOICE_TYPE;
  status: INVOICE_STATUS;
  invoiceNumber: string;
  paymentType: INVOICE_PAYMENT_TYPE;
  note?: string | null
  completionDate?: Date | null
  issueDate?: Date | null
  paymentDate?: Date | null
  netAmount: number
  vatAmount: number
  vatKey: string
  title?: string | null
  //
  asEmail: boolean
  pattyCash: boolean
  inSalary: boolean
  //
  projectId?: Project["id"] | null
  project?: Project
  //
  milestoneId?: Milestone["id"] | null
  milestone?: Milestone
  //
  contractorId?: Company["id"] | null
  contractor?: Company
  //
  employeeId?: User["id"] | null
  employee?: User
  //
  supplierId?: Company["id"] | null
  supplier?: Company
  //
  documentId?: Document["id"] | null
  document?: Document
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
  //
  approvedBy?: number | null
  approvedOn?: Date | null
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  payedOn?: Date | null
}

export type CreateInvoiceProperties = Omit<Invoice, "id" | "createdOn" | "updatedOn" | "approvedBy" | "approvedOn" | "payedOn">;