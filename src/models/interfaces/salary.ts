
import { User } from "./user";

export interface Salary {
  id?: number
  startDate: Date;
  endDate?: Date | null;
  hourlyRate?: number | null;
  dailyRate?: number | null;
  user?: User
  userId?: number | null
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateSalaryProperties = Omit<Salary, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;
