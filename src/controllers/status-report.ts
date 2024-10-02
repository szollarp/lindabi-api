import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put, Path, Post, Delete } from "tsoa";
import type { CreateTenantProperties, Tenant } from "../models/interfaces/tenant";
import type { ContextualRequest } from "../types";
import { CreateDocumentProperties } from "../models/interfaces/document";
import { StatusReport } from "../models/interfaces/status-report";

@Route("status-reports")
export class StatusReportController extends Controller {
  /**
   * Retrieves a list of all status reports within the system. This endpoint requires
   * authentication and is protected by JWT tokens with the "StatusReport:List" permission.
   *
   * @returns An array of status report objects with partial details to protect sensitive information.
   */
  @Tags("Status Report")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tenant", "StatusReport:List"])
  public async getStatusReports(@Request() request: ContextualRequest): Promise<Partial<StatusReport>[]> {
    const { context, user } = request;
    return await context.services.statusReport.getStatusReports(context);
  }

  @Tags("Status Report")
  @SuccessResponse("200", "OK")
  @Get("/related-projects")
  @Security("jwtToken", ["Tenant", "StatusReport:List"])
  public async getRelatedProjects(@Request() request: ContextualRequest): Promise<{ id: number, name: string }[]> {
    const { context, user } = request;
    return await context.services.statusReport.getRelatedProjects(context, user);
  }
}