import {
  Body,
  Controller,
  Delete,
  Put,
  Get,
  Post,
  Query,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Request,
  UploadedFiles
} from "tsoa";
import type { ContextualRequest } from "../types";
import type { WorkSiteEvent, WorkSiteEventType, MonthlyWorkStatus } from "../models/interfaces/work-site-event";
import type { DocumentType } from "../models/interfaces/document";

/**
 * Work site event types
 */
export enum WorkSiteEventTypeEnum {
  FIRST_ENTRY = "first_entry",
  ENTRY = "entry",
  EXIT = "exit",
  NOTE = "note",
  WORK_START_AT_SITE = "work_start_at_site",
  GPS_SIGNAL_LOST = "gps_signal_lost",
  GPS_SIGNAL_RECOVERED = "gps_signal_recovered",
  APP_BACKGROUND = "app_background",
  APP_FOREGROUND = "app_foreground",
  APP_INIT = "app_init"
}

export interface CreateWorkSiteEventRequest {
  projectId: number;
  /**
   * @isEnum WorkSiteEventTypeEnum
   */
  eventType: WorkSiteEventType;
  latitude?: number | null;
  longitude?: number | null;
  occurredAt: Date;
  appVersion?: string | null;
  metadata?: Record<string, any> | null;
}

@Route("work-site-events")
export class WorkSiteEventController extends Controller {
  /**
   * Töröl egy munkaterület eseményt.
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   * 
   * @param eventId - A törlendő esemény ID-ja
   */
  @Tags("WorkSiteEvent")
  @SuccessResponse("204", "No Content")
  @Delete("/{eventId}")
  @Security("authentication", ["Tenant"])
  public async deleteEvent(
    @Request() request: ContextualRequest,
    eventId: number
  ): Promise<void> {
    const { context, user } = request;
    await context.services.workSiteEvent.deleteEvent(context, user.tenant, user.id, eventId);
  }

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
   * Lekéri a felhasználó havi munkastátuszait (melyik napon volt munkavégzés, melyiken nem).
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   * 
   * @param date - A hónap egy napja vagy hónap kezdete (pl. "2025-12-01")
   * @returns Havi statisztika
   */
  @Tags("WorkSiteEvent")
  @SuccessResponse("200", "OK")
  @Get("/monthly")
  @Security("authentication", ["Tenant"])
  public async getMonthlyEvents(
    @Request() request: ContextualRequest,
    @Query() date?: string
  ): Promise<MonthlyWorkStatus> {
    const { context, user } = request;
    const targetDate = date ? new Date(date) : new Date();
    return await context.services.workSiteEvent.getMonthlyWorkStatus(context, user.tenant, user.id, targetDate);
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
    @Query() projectId?: number,
    @Query() date?: string
  ): Promise<WorkSiteEvent[]> {
    const { context, user } = request;
    const targetDate = date ? new Date(date) : new Date();
    return await context.services.workSiteEvent.getEventsByDate(context, user.tenant, user.id, targetDate, projectId);
  }

  /**
   * Dokumentumok feltöltése egy munkaterület eseményhez.
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   */
  @Tags("WorkSiteEvent")
  @SuccessResponse("200", "OK")
  @Put("/{eventId}/documents")
  @Security("authentication", ["Tenant"])
  public async uploadDocuments(
    @Request() request: ContextualRequest,
    eventId: number,
    @Query() type: DocumentType,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<any> {
    const { context, user } = request;
    // Note: The ownerType string "work_site_event" must match what the document service expects/allows
    // We might need to update the DocumentModel associations if not already supported,
    // but based on typical patterns in this codebase, we can try using "work_site_event" or similar.
    // Looking at other controllers, they use strings like "user", "tender", etc.
    return await context.services.document.upload(context, user, eventId, "work_site_event", type, files, {}, false);
  }
}