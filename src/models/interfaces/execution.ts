import { EXECUTION_SETTLEMENT, EXECUTION_STATUS } from "../../constants"
import { Document } from "./document"

export interface Execution {
  id: number
  dueDate: Date
  settlement: EXECUTION_SETTLEMENT
  type: string

  notes?: string | null
  status?: EXECUTION_STATUS | null;
  documents?: Document[]
  //
  employeeId: number
  projectId: number
  //
  approvedBy?: number | null
  approvedOn?: Date | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
  //
  quantity?: number
  unit?: string
  //
  distance?: number
  //
  workdayStart?: string | null
  workdayEnd?: string | null
  breakStart?: string | null
  breakEnd?: string | null
};

export type CreateExecutionProperties = Omit<Execution, "id" | "createdOn" | "updatedOn">;