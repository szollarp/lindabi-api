import { Document } from "./document";
import type { Project } from "./project";

export type TrackingEventType = "entry" | "exit" | "gps_signal_lost" | "gps_signal_recovered" | "app_background" | "app_foreground" | "app_init" | "note";

export interface TrackingEvent {
  id: number;
  tenantId: number;
  projectId?: number | null;
  project?: Project | null;
  eventType: TrackingEventType;
  latitude?: number | null;
  longitude?: number | null;
  metadata?: Record<string, any> | null;
  occurredAt: Date;
  appVersion?: string | null;
  createdOn?: Date;
  updatedOn?: Date | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  deletedOn?: Date | null;
  //
  documentIds?: Document["id"][] | null
  documents?: Document[]
}

export type CreateTrackingEventProperties = Omit<
  TrackingEvent,
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
