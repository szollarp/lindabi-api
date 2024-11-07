import type { Contact } from "./contact";
import type { Project } from "./project";

export interface ProjectSupervisor {
  startDate?: Date | null;
  endDate?: Date | null;
  //
  contactId: Contact["id"];
  contact?: Contact;
  //
  projectId: Project["id"];
  project?: Project;
  //
  createdOn: Date;
  updatedOn: Date;
};

export type CreateProjectSupervisorProperties = Omit<ProjectSupervisor, "createdOn" | "updatedOn">;