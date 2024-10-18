export interface CompletionCertificate {
  id: number
  amount: number
  approved: boolean
  approvedOn?: Date | null
  //
  employeeId: number
  orderFormId: number
  projectId: number
  //
  description?: string | null
  deviation?: string | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateCompletionCertificateProperties = Omit<CompletionCertificate, "id" | "createdOn" | "updatedOn">;