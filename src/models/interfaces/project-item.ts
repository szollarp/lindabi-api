import type { PROJECT_ITEM_STATUS, PROJECT_ITEM_TYPE } from "../../constants"
import type { Project } from "./project"
import type { User } from "./user"

export interface ProjectItem {
  id: number
  //
  num: number
  name: string
  quantity: number
  unit: string
  status: PROJECT_ITEM_STATUS
  type: PROJECT_ITEM_TYPE
  netAmount?: number | null
  notes?: string | null
  //
  materialNetAmount?: number | null
  feeNetAmount?: number | null
  //
  projectId: Project["id"]
  project?: Project
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateProjectItemProperties = Omit<ProjectItem, "id" | "num" | "createdOn" | "updatedBy" | "updatedOn">;