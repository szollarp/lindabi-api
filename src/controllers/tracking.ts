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
import type { TrackingEvent, TrackingEventType, MonthlyWorkStatus } from "../models/interfaces/tracking-event";
import type { DocumentType } from "../models/interfaces/document";
import { Workspace } from "../models/interfaces/employee-schedule";

/**
 * Work site event types
 */
export enum TrackingEventTypeEnum {
  ENTRY = "entry",
  EXIT = "exit",
  NOTE = "note",
  GPS_SIGNAL_LOST = "gps_signal_lost",
  GPS_SIGNAL_RECOVERED = "gps_signal_recovered",
  APP_BACKGROUND = "app_background",
  APP_FOREGROUND = "app_foreground",
  APP_INIT = "app_init"
}

export interface CreateTrackingEventRequest {
  projectId?: number | null;
  eventType: TrackingEventType;
  latitude?: number | null;
  longitude?: number | null;
  occurredAt: Date;
  appVersion?: string | null;
  metadata?: Record<string, any> | null;
}

@Route("trackings")
export class TrackingEventController extends Controller {
  /**
   * Retrieves today's workspace (work schedule) for the authenticated user.
   * This endpoint is designed for mobile applications and returns all necessary data
   * including project details and location information.
   * 
   * @returns The workspace object for today's work schedule, or null if no work is scheduled.
   */
  @Tags("Tracking")
  @SuccessResponse("200", "OK")
  @Get("today")
  @Security("authentication", ["Tenant"])
  public async getTodayWorkspace(@Request() request: ContextualRequest): Promise<Workspace[]> {
    const { context, user } = request;
    return await context.services.employeeSchedule.getTodayWorkspace(context, user);
  }

  /**
   * Töröl egy munkaterület eseményt.
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   * 
   * @param eventId - A törlendő esemény ID-ja
   */
  @Tags("Tracking")
  @SuccessResponse("204", "No Content")
  @Delete("/{eventId}")
  @Security("authentication", ["Tenant"])
  public async deleteEvent(
    @Request() request: ContextualRequest,
    eventId: number
  ): Promise<void> {
    const { context, user } = request;
    await context.services.trackingEvent.deleteEvent(context, user.tenant, user.id, eventId);
  }

  /**
   * Rögzíti a munkaterületre történő belépés/kilépés eseményét.
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   */
  @Tags("Tracking")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant"])
  public async createEvent(
    @Request() request: ContextualRequest,
    @Body() body: CreateTrackingEventRequest
  ): Promise<TrackingEvent> {
    const { context, user } = request;
    return await context.services.trackingEvent.createEvent(context, user.tenant, user.id, body);
  }

  /**
   * Lekéri a felhasználó havi munkastátuszait (melyik napon volt munkavégzés, melyiken nem).
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   * 
   * @param date - A hónap egy napja vagy hónap kezdete (pl. "2025-12-01")
   * @returns Havi statisztika
   */
  @Tags("Tracking")
  @SuccessResponse("200", "OK")
  @Get("/monthly")
  @Security("authentication", ["Tenant"])
  public async getMonthlyEvents(
    @Request() request: ContextualRequest,
    @Query() date?: string
  ): Promise<MonthlyWorkStatus> {
    const { context, user } = request;
    const targetDate = date ? new Date(date) : new Date();
    return await context.services.trackingEvent.getMonthlyWorkStatus(context, user.tenant, user.id, targetDate);
  }

  /**
   * Lekéri a felhasználó munkaterület eseményeit egy adott napra.
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   * 
   * @param date - A dátum ISO string formátumban (pl. "2025-12-11") vagy Date objektum
   * @param TrackingId - A munkaterület ID-ja (project ID), opcionális
   * @returns A napra vonatkozó munkaterület események listája
   */
  @Tags("Tracking")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant"])
  public async getEventsByDate(
    @Request() request: ContextualRequest,
    @Query() projectId?: number,
    @Query() date?: string
  ): Promise<TrackingEvent[]> {
    const { context, user } = request;
    const targetDate = date ? new Date(date) : new Date();
    return await context.services.trackingEvent.getEventsByDate(context, user.tenant, user.id, targetDate, projectId);
  }

  /**
   * Dokumentumok feltöltése egy munkaterület eseményhez.
   * Csak bejelentkezett (Tenant) felhasználó hívhatja.
   */
  @Tags("Tracking")
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
    return await context.services.document.upload(context, user, eventId, "tracking_event", type, files, {}, false);
  }
}