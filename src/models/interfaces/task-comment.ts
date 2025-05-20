import { User } from './user';
import { Tenant } from './tenant';
import { Task } from './task';

export interface TaskComment {
  id: number;
  //
  taskId: Task["id"];
  //
  message: string;
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
}

export type CreateTaskCommentProperties = Omit<TaskComment, 'id' | 'taskId' | 'createdOn' | 'updatedOn'>;