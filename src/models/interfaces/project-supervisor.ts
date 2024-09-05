export interface ProjectSupervisor {
  contactId: number;
  projectId: number;
  //
  startDate?: Date | null;
  endDate?: Date | null;
  //
  createdOn: Date;
  updatedOn: Date;
};

export type CreateProjectSupervisorProperties = Omit<ProjectSupervisor, "createdOn" | "updatedOn">;