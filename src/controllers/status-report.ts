import {
  Controller, Route, Request, SuccessResponse, Get, Tags, Security,
  Body, Put, Path, Post, Delete, Query, UploadedFiles
} from "tsoa";
import type { ContextualRequest } from "../types";
import { CreateStatusReportProperties, StatusReport } from "../models/interfaces/status-report";
import { DocumentType } from "../models/interfaces/document";

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
  @Security("authentication", ["Tenant", "Report:List"])
  public async getStatusReports(@Request() request: ContextualRequest): Promise<Partial<StatusReport>[]> {
    const { context, user } = request;
    return await context.services.statusReport.list(context, user);
  }

  /**
   * Retrieves a list of projects related to the current user. This endpoint requires
   * authentication and is protected by JWT tokens with the "StatusReport:List" permission.
   *
   * @returns An array of project objects with partial details to protect sensitive information.
   */
  @Tags("Status Report")
  @SuccessResponse("200", "OK")
  @Get("/related-projects")
  @Security("authentication", ["Tenant", "Report:List"])
  public async getRelatedProjects(@Request() request: ContextualRequest): Promise<{ id: number, name: string }[]> {
    const { context, user } = request;
    return await context.services.statusReport.getProjects(context, user);
  }

  /**
   * Creates a new status report with the provided properties. This operation is secured and
   * requires a JWT token with "StatusReport:Create" permission.
   *
   * @param body The properties required to create a new status report.
   * @returns The newly created status report object with partial details, or null if creation fails.
   */
  @Tags("Status Report")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant", "Report:Create"])
  public async createStatusReport(@Request() request: ContextualRequest, @Body() body: CreateStatusReportProperties): Promise<Partial<StatusReport> | { exists: boolean }> {
    const { context, user } = request;
    return await context.services.statusReport.create(context, user, body);
  }

  /**
   * Retrieves the details of a specific status report by its unique identifier. This endpoint
   * requires JWT authentication and is protected by the "StatusReport:Get" permission.
   *
   * @param id The unique identifier of the status report to retrieve.
   * @returns The status report object with partial details, or null if the report is not found
   * or the user does not have permission to access it.
   * Sensitive information is omitted.
   */
  @Tags("Status Report")
  @SuccessResponse("200", "OK")
  @Get("{id}")
  @Security("authentication", ["Tenant", "Report:Get"])
  public async getStatusReport(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<StatusReport> | null> {
    const { context, user } = request;
    return await context.services.statusReport.get(context, user, id);
  }

  /**
   * Updates the information of an existing status report, identified by their ID. Access to this
   * endpoint is restricted to authenticated requests with "StatusReport:Update" permission.
   *
   * @param id The unique identifier of the status report to update.
   * @param body A partial status report object containing the fields to update.
   * @returns The updated status report object with partial details, or null if the update fails.
   */
  @Tags("Status Report")
  @SuccessResponse("200", "OK")
  @Put("{id}")
  @Security("authentication", ["Report:Update"])
  public async updateStatusReport(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<StatusReport>): Promise<Partial<StatusReport> | null> {
    const { context, user } = request;
    return await context.services.statusReport.update(context, user, id, body);
  }

  /**
   * Upload documents for the specified status reports by their ID.
   * This endpoint is protected by JWT authentication, requiring "StatusReport:UpdateDocuments" permission.
   *
   * @param id The unique identifier of the status report.
   * @param body A partial document objects containing the data to update.
   * @returns A status report documents objects containing partial information, or null if no documents is found. 
   * Sensitive information is omitted.
   */
  @Tags("Status Report")
  @SuccessResponse("200", "OK")
  @Put("{id}/documents")
  @Security("authentication", ["Tenant", "Report:Update"])
  public async uploadDocuments(@Request() request: ContextualRequest, @Path() id: number, @Query() type: DocumentType, @UploadedFiles() files: Express.Multer.File[],): Promise<any> {
    const { context, user } = request;
    return await context.services.document.upload(context, user, id, "report", type, files, {}, false);
  }

  /**
   * Removes a specific document from a status report by its document ID.
   * This endpoint requires JWT authentication and is protected with the "StatusReport:DeleteDocument" permission,
   * ensuring that only authorized users can delete documents.
   *
   * @param id The unique identifier of the status report from which the document will be removed.
   * @param documentId The unique identifier of the document to be removed.
   * @returns An object indicating whether the document removal was successful.
   */
  @Tags("Status Report")
  @SuccessResponse("200", "OK")
  @Delete("{id}/documents/{documentId}")
  @Security("authentication", ["Tenant", "Report:Update"])
  public async removeDocument(@Request() request: ContextualRequest, @Path() id: number, @Path() documentId: number): Promise<{ removed: boolean }> {
    const { context } = request;
    return await context.services.document.removeDocument(context, documentId);
  }

  /**
   * Deletes all documents of a specific type associated with a status report by its ID.
   * This endpoint is protected by JWT authentication, requiring "StatusReport:DeleteDocument" permission.
   *
   * @param id The unique identifier of the status report.
   * @param type The type of documents to remove.
   * @returns An object indicating whether the deletion of documents was successful.
   */
  @Tags("Status Report")
  @SuccessResponse("200", "OK")
  @Delete("{id}/documents-by-type")
  @Security("authentication", ["Tenant", "Report:Update"])
  public async removeDocuments(@Request() request: ContextualRequest, @Path() id: number, @Query() type: DocumentType,): Promise<{ removed: boolean }> {
    const { context } = request;
    return await context.services.document.removeDocuments(context, id, "report", type);
  }
}