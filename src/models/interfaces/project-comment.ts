import type { Contact } from "./contact"
import type { Project } from "./project"
import type { User } from "./user"

export interface ProjectComment {
  id: number
  //
  notes: string
  checked: boolean
  //
  contactId: Contact["id"]
  contact?: Contact
  //
  projectId: Project["id"]
  project?: Project
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateProjectCommentProperties = Omit<ProjectComment, "id" | "createdOn" | "updatedBy" | "updatedOn">;