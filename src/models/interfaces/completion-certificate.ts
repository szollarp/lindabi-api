import { COMPLETION_CERTIFICATE_STATUS } from "../../constants"
import { Tenant } from "./tenant"
import type { User } from "./user"

export interface CompletionCertificate {
  id: number
  //
  amount: number
  status: COMPLETION_CERTIFICATE_STATUS
  //
  projectId: number
  employeeId: number
  orderFormId: number
  //
  description?: string | null
  deviation?: string | null
  //
  approvedOn?: Date | null
  approvedBy?: User["id"] | null
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateCompletionCertificateProperties = Omit<CompletionCertificate, "id" | "status" | "createdOn" | "updatedOn">;