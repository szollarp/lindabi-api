import type { Contact } from "./contact";
import type { Project } from "./project";

export interface ProjectContact {
  userContact: boolean;
  customerContact: boolean;
  canShow: boolean;
  //
  contactId: Contact["id"];
  contact?: Contact;
  //
  projectId: Project["id"];
  project?: Project
  //
  createdOn: Date;
  updatedOn: Date;
};

export type CreateProjectContactProperties = Omit<ProjectContact, "createdOn" | "updatedOn">;