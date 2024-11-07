import type { MILESTONE_STATUS } from "../../constants"
import type { Document } from "./document";
import type { Project } from "./project";
import type { User } from "./user";

export interface Milestone {
  id: number
  //
  name: string;
  dueDate: Date
  netAmount?: number | null
  notes?: string
  status: MILESTONE_STATUS
  invoiceNumber?: string | null
  invoiceDate?: Date | null
  tigNotes?: string | null
  //
  projectId: Project["id"]
  project?: Project;
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
  //
  documents?: Document[]
};

export type CreateMilestoneProperties = Omit<Milestone, "id" | "projectId" | "createdAt" | "createdOn" | "updatedBy" | "updatedOn">;