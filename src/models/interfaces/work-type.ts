import { Tenant } from "./tenant";
import { User } from "./user";

export interface WorkType {
  id: number;
  name: string;
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
}

export type CreateWorkTypeProperties = Omit<WorkType, 'id' | 'createdAt' | 'updatedAt'>;