import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Request
} from "tsoa";
import type { ContextualRequest } from "../types";
import type { WorkSiteEvent, WorkSiteEventType } from "../models/interfaces/work-site-event";

/**
 * Work site event types
 */
export enum WorkSiteEventTypeEnum {
  FIRST_ENTRY = "first_entry",
  ENTRY = "entry",
  EXIT = "exit",
  WORK_START_AT_SITE = "work_start_at_site",
  GPS_SIGNAL_LOST = "gps_signal_lost",
  GPS_SIGNAL_RECOVERED = "gps_signal_recovered",
  APP_BACKGROUND = "app_background",
  APP_FOREGROUND = "app_foreground",
  APP_INIT = "app_init"
}

export interface CreateWorkSiteEventRequest {
  workSiteId?: string | null;
  workSiteName?: string | null;
  /**
   * @isEnum WorkSiteEventTypeEnum
   */
  eventType: WorkSiteEventType;
  latitude?: number | null;
  longitude?: number | null;
  occurredAt: Date;
}

@Route("work-site-events")
export class WorkSiteEventController extends Controller {
  /**
   * Rögzíti a munkaterületre történő belépés/kilépés eseményét.
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   */
  @Tags("WorkSiteEvent")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant"])
  public async createEvent(
    @Request() request: ContextualRequest,
    @Body() body: CreateWorkSiteEventRequest
  ): Promise<WorkSiteEvent> {
    const { context, user } = request;
    return await context.services.workSiteEvent.createEvent(context, user.tenant, user.id, body);
  }

  /**
   * Lekéri a felhasználó munkaterület eseményeit egy adott napra.
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   * 
   * @param date - A dátum ISO string formátumban (pl. "2025-12-11") vagy Date objektum
   * @param workSiteId - A munkaterület ID-ja (project ID), opcionális
   * @returns A napra vonatkozó munkaterület események listája
   */
  @Tags("WorkSiteEvent")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant"])
  public async getEventsByDate(
    @Request() request: ContextualRequest,
    @Query() date?: string,
    @Query() workSiteId?: string
  ): Promise<WorkSiteEvent[]> {
    const { context, user } = request;
    const targetDate = date ? new Date(date) : new Date();
    return await context.services.workSiteEvent.getEventsByDate(context, user.tenant, user.id, targetDate, workSiteId);
  }
}
