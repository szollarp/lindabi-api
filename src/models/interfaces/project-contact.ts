export interface ProjectContact {
  contactId: number;
  projectId: number;
  //
  userContact: boolean;
  customerContact: boolean;
  canShow: boolean;
  //
  createdOn: Date;
  updatedOn: Date;
};

export type CreateProjectContactProperties = Omit<ProjectContact, "createdOn" | "updatedOn">;