import type { User } from "./user";
import type { Project } from "./project";

export interface ProjectSupervisor {
  startDate?: Date | null;
  endDate?: Date | null;
  //
  userId: User["id"];
  user?: User;
  //
  projectId: Project["id"];
  project?: Project;
  //
  createdOn: Date;
  updatedOn: Date;
};

export type CreateProjectSupervisorProperties = Omit<ProjectSupervisor, "createdOn" | "updatedOn">;