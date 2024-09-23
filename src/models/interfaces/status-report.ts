import { STATUS_REPORT_STATUS } from "../../constants"
import { Document } from "./document";

export interface StatusReport {
  id: number
  dueDate: Date
  status: STATUS_REPORT_STATUS
  notes?: string
  projectId: number
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
  documents?: Document[]
};

export type CreateStatusReportProperties = Omit<StatusReport, "id" | "projectId" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;