import { User } from './user';
import { Tenant } from './tenant';

export interface TaskColumn {
  id: number;
  uid: string;
  //
  name: string;
  position: number;
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  fixed?: boolean
  finished?: boolean
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
}

export type CreateTaskColumnProperties = Omit<TaskColumn, 'id' | 'createdOn' | 'updatedOn'>;