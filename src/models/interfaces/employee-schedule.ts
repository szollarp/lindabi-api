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

export type CreateHolidayScheduleProperties = Pick<EmployeeSchedule, "startDate" | "endDate" | "employeeId">;

export interface Workspace {
  id: number;
  type: EmployeeScheduleType;
  startDate: Date;
  endDate: Date;
  project?: {
    id: number;
    number: string;
    name?: string | null;
    shortName?: string | null;
    location?: {
      id: number;
      city: string;
      address: string;
      zipCode: string;
      country: string;
      region?: string | null;
    } | null;
  } | null;
}