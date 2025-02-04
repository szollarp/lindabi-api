import type { Project } from "./project";
import type { Tenant } from "./tenant";
import type { User } from "./user";

export type EmployeeScheduleType = "work" | "not working" | "rainy day" | "background work";

export interface EmployeeSchedule {
  id?: number;
  type: EmployeeScheduleType;
  startDate: Date;
  endDate: Date;
  //
  employeeId?: User["id"] | string | null
  company?: User | null
  //
  projectId?: Project["id"] | null
  project?: Project
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  updatedBy?: User["id"] | null
  createdBy?: User["id"]
  creator?: User;
}

export type CreateEmployeeScheduleProperties = Omit<EmployeeSchedule, "id" | "createdOn" | "updatedOn">;