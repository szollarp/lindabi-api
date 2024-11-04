import { COMPLETION_CERTIFICATE_STATUS } from "../../constants"

export interface CompletionCertificate {
  id: number
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
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
  approvedOn?: Date | null
  approvedBy?: number | null
};

export type CreateCompletionCertificateProperties = Omit<CompletionCertificate, "id" | "status" | "createdOn" | "updatedOn">;