import type { EXECUTION_SETTLEMENT, EXECUTION_STATUS } from "../../constants"
import type { Document } from "./document"
import type { Project } from "./project"
import { ProjectItem } from "./project-item"
import { Tenant } from "./tenant"
import type { User } from "./user"

export interface Execution {
  id: number
  //
  dueDate: Date
  settlement: EXECUTION_SETTLEMENT
  notes?: string | null
  status?: EXECUTION_STATUS | null;
  quantity?: number
  unit?: string
  distance?: number
  workdayStart?: string | null
  workdayEnd?: string | null
  breakStart?: string | null
  breakEnd?: string | null
  //
  documents?: Document[]
  //
  employeeId: User["id"]
  employee?: User
  //
  projectId: Project["id"]
  project?: Project
  //
  projectItemId: ProjectItem["id"]
  projectItem?: ProjectItem
  //
  approvedBy?: User["id"] | null
  approvedOn?: Date | null
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateExecutionProperties = Omit<Execution, "id" | "createdOn" | "updatedOn">;