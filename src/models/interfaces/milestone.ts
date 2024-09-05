import { MILESTONE_STATUS } from "../../constants"
import { Document } from "./document";

export interface Milestone {
  id: number
  name: string;
  dueDate: Date
  netAmount?: number | null
  notes?: string
  status: MILESTONE_STATUS
  invoiceNumber?: string | null
  invoiceDate?: Date | null
  tigNotes?: string | null
  projectId: number
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
  documents?: Document[]
};

export type CreateMilestoneProperties = Omit<Milestone, "id" | "projectId" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;