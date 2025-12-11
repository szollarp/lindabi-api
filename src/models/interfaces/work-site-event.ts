export type WorkSiteEventType = "first_entry" | "entry" | "exit" | "work_start_at_site" | "gps_signal_lost" | "gps_signal_recovered" | "app_background" | "app_foreground" | "app_init";

export interface WorkSiteEvent {
  id: number;
  tenantId: number;
  userId: number;
  workSiteId?: string | null;
  workSiteName?: string | null;
  eventType: WorkSiteEventType;
  latitude?: number | null;
  longitude?: number | null;
  occurredAt: Date;
  createdOn?: Date;
  updatedOn?: Date | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}

export type CreateWorkSiteEventProperties = Omit<
  WorkSiteEvent,
  "id" | "createdOn" | "updatedOn" | "updatedBy"
>;
