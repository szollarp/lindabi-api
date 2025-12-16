import { Document } from "./document";
import type { Project } from "./project";

export type WorkSiteEventType = "first_entry" | "entry" | "exit" | "work_start_at_site" | "gps_signal_lost" | "gps_signal_recovered" | "app_background" | "app_foreground" | "app_init" | "note";

export interface WorkSiteEvent {
  id: number;
  tenantId: number;
  userId: number;
  projectId?: number | null;
  project?: Project | null;
  eventType: WorkSiteEventType;
  latitude?: number | null;
  longitude?: number | null;
  metadata?: Record<string, any> | null;
  occurredAt: Date;
  appVersion?: string | null;
  createdOn?: Date;
  updatedOn?: Date | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  deleted?: boolean;
  deletedAt?: Date | null;
  //
  documentIds?: Document["id"][] | null
  documents?: Document[]
}

export type CreateWorkSiteEventProperties = Omit<
  WorkSiteEvent,
  "id" | "createdOn" | "updatedOn" | "updatedBy"
>;

export interface DailyWorkStatus {
  date: string; // YYYY-MM-DD
  status: 'recorded' | 'missing' | 'none';
  hasWorkLogs: boolean;
  projectNames: string[];
}

export interface MonthlyWorkStatus {
  month: string; // YYYY-MM
  days: DailyWorkStatus[];
}
