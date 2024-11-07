
import type { User } from "./user";

export interface Salary {
  id?: number
  //
  startDate: Date;
  endDate?: Date | null;
  hourlyRate?: number | null;
  dailyRate?: number | null;
  //
  userId?: User["id"] | null
  user?: User
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
};

export type CreateSalaryProperties = Omit<Salary, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;
