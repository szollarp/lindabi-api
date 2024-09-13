import { PROJECT_ITEM_STATUS, PROJECT_ITEM_TYPE } from "../../constants"

export interface ProjectItem {
  id: number
  name: string
  quantity: number
  unit: string
  status: PROJECT_ITEM_STATUS
  type: PROJECT_ITEM_TYPE
  netAmount?: number | null
  notes?: string | null
  projectId: number
  num: number
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateProjectItemProperties = Omit<ProjectItem, "id" | "num" | "createdOn" | "updatedBy" | "updatedOn">;