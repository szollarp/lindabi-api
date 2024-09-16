export interface ProjectComment {
  id: number
  notes: string
  contactId: number
  projectId: number
  checked: boolean
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateProjectCommentProperties = Omit<ProjectComment, "id" | "createdOn" | "updatedBy" | "updatedOn">;