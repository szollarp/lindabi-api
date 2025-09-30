import { Document } from "./document";
import { Project } from "./project";
import { TaskColumn } from "./task-column";
import { TaskComment } from "./task-comment";
import { Tenant } from "./tenant";
import { Tender } from "./tender";
import { User } from "./user";

export type TaskType = 'task' | 'fix';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  uid: string;
  //
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  //
  startDate: Date;
  dueDate: Date;
  //
  column?: TaskColumn
  columnId: TaskColumn["id"]
  //
  assignee?: User[]
  assigneeIds?: User["id"][]
  //
  position: number
  //
  project?: Project;
  projectId?: Project["id"]
  //
  tender?: Tender;
  tenderId?: Tender["id"];
  //
  comments?: TaskComment[];
  commentIds?: TaskComment["id"][];
  //
  attachmentIds?: Document["id"][] | null
  attachments?: Document[]
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  reporter?: User
  updatedBy?: User["id"] | null
}

export type CreateTaskProperties = Omit<Task, 'id' | 'uid' | 'description' | 'projectId' | 'tenderId' | 'assignedIds' | 'createdAt' | 'updatedAt' | 'dueDate' | 'startDate' | 'position'>;

export interface TaskStatistics {
  totalAssignedTasks: number;
  tasksInProgress: number;
  overdueTasks: number;
  overdueTasksByUser: Array<{
    userId: number;
    userName: string;
    overdueCount: number;
  }>;
}