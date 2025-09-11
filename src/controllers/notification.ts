import {
  Controller, Route, Request, SuccessResponse, Get, Tags, Security,
  Put,
  Path
} from "tsoa";
import type { ContextualRequest } from "../types";
import { Notification } from "../models/interfaces/notification";

@Route("notifications")
export class NotificationController extends Controller {
  @Tags("Notification")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Notification:List"])
  public async getNotifications(@Request() request: ContextualRequest): Promise<Notification[]> {
    const { context, user } = request;
    return await context.services.notification.list(context, user);
  }

  @Tags("Notification")
  @SuccessResponse("200", "OK")
  @Put("/{id}/read")
  @Security("authentication", ["Notification:List"])
  public async setRead(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.notification.setRead(context, user, id);
  }

  @Tags("Notification")
  @SuccessResponse("200", "OK")
  @Put("/all-read")
  @Security("authentication", ["Notification:List"])
  public async setAllRead(@Request() request: ContextualRequest): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.notification.setAllRead(context, user);
  }
}