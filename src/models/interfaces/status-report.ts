import type { STATUS_REPORT_STATUS } from "../../constants"
import type { Document } from "./document";
import type { Project } from "./project";
import { Tenant } from "./tenant";
import type { User } from "./user";

export interface StatusReport {
  id: number
  //
  dueDate: Date
  availableToClient: boolean
  status: STATUS_REPORT_STATUS
  notes?: string | null
  //
  projectId: Project["id"]
  project?: Project
  //
  documentIds?: Document["id"][]
  documents?: Document[]
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateStatusReportProperties = Omit<StatusReport, "id" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;