import {
  Controller, Route, Request, SuccessResponse, Get, Tags, Security,
  Body, Put, Path, Post, Delete, Query, UploadedFiles
} from "tsoa";
import { DocumentType } from "../models/interfaces/document";
import { Execution } from "../models/interfaces/execution";
import type { ContextualRequest } from "../types";
import { Project } from "../models/interfaces/project";

@Route("executions")
export class ExecutionController extends Controller {
  /**
   * Retrieves a list of all executions within the system. This endpoint requires
   * authentication and is protected by JWT tokens with the "Execution:List" permission.
   *
   * @returns An array of execution objects with partial details to protect sensitive information.
   */
  @Tags("Execution")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tenant", "Execution:List"])
  public async getExecutions(@Request() request: ContextualRequest): Promise<Partial<Execution>[]> {
    const { context, user } = request;
    return await context.services.execution.list(context, user);
  }

  /**
   * Retrieves a list of projects related to the current user. This endpoint requires
   * authentication and is protected by JWT tokens with the "Execution:List" permission.
   *
   * @returns An array of project objects with partial details to protect sensitive information.
   */
  @Tags("Execution")
  @SuccessResponse("200", "OK")
  @Get("/related-projects")
  @Security("jwtToken", ["Tenant", "Execution:List"])
  public async getRelatedProjects(@Request() request: ContextualRequest): Promise<Array<Partial<Project>>> {
    const { context, user } = request;
    return await context.services.execution.getProjects(context, user);
  }

  /**
   * Creates a new execution with the provided properties. This operation is secured and
   * requires a JWT token with "Execution:Create" permission.
   *
   * @param body The properties required to create a new execution.
   * @returns The newly created execution object with partial details, or null if creation fails.
   */
  @Tags("Execution")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Tenant", "Execution:Create"])
  public async createExecution(@Request() request: ContextualRequest, @Body() body: Partial<Execution>): Promise<Partial<Execution> | { invalidEmployeeDocuments?: boolean, exists?: boolean, missingStatusReport?: boolean }> {
    const { context, user } = request;
    return await context.services.execution.create(context, user, body);
  }

  /**
   * Retrieves the details of a specific execution by its unique identifier. This endpoint
   * requires JWT authentication and is protected by the "Execution:Get" permission.
   *
   * @param id The unique identifier of the execution to retrieve.
   * @returns The execution object with partial details, or null if the report is not found
   * or the user does not have permission to access it.
   * Sensitive information is omitted.
   */
  @Tags("Execution")
  @SuccessResponse("200", "OK")
  @Get("{id}")
  @Security("jwtToken", ["Tenant", "Execution:Get"])
  public async getExecution(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Execution> | null> {
    const { context, user } = request;
    return await context.services.execution.get(context, user, id);
  }

  /**
   * Updates the information of an existing execution, identified by their ID. Access to this
   * endpoint is restricted to authenticated requests with "Execution:Update" permission.
   *
   * @param id The unique identifier of the execution to update.
   * @param body A partial execution object containing the fields to update.
   * @returns The updated execution object with partial details, or null if the update fails.
   */
  @Tags("Execution")
  @SuccessResponse("200", "OK")
  @Put("{id}")
  @Security("jwtToken", ["Execution:Update"])
  public async updateExecution(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Execution>): Promise<Partial<Execution> | null> {
    const { context, user } = request;
    return await context.services.execution.update(context, user, id, body);
  }

  /**
   * Approve of an existing execution, identified by their ID. Access to this
   * endpoint is restricted to authenticated requests with "Execution:Approve" permission.
   *
   * @param id The unique identifier of the execution to update.
   * @returns The updated execution object with partial details, or null if the update fails.
   */
  @Tags("Execution")
  @SuccessResponse("200", "OK")
  @Put("{id}/approve")
  @Security("jwtToken", ["Execution:Approve"])
  public async approveExecution(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Execution> | null> {
    const { context, user } = request;
    return await context.services.execution.approve(context, user, id);
  }

  /**
   * Upload documents for the specified executions by their ID.
   * This endpoint is protected by JWT authentication, requiring "Execution:UpdateDocuments" permission.
   *
   * @param id The unique identifier of the execution.
   * @param body A partial document objects containing the data to update.
   * @returns A execution documents objects containing partial information, or null if no documents is found. 
   * Sensitive information is omitted.
   */
  @Tags("Execution")
  @SuccessResponse("200", "OK")
  @Put("{id}/documents")
  @Security("jwtToken", ["Tenant", "Execution:Update"])
  public async uploadDocuments(@Request() request: ContextualRequest, @Path() id: number, @Query() type: DocumentType, @UploadedFiles() files: Express.Multer.File[],): Promise<any> {
    const { context, user } = request;
    return await context.services.document.upload(context, user, id, "execution", type, files, {}, false);
  }

  /**
   * Removes a specific document from a execution by its document ID.
   * This endpoint requires JWT authentication and is protected with the "Execution:DeleteDocument" permission,
   * ensuring that only authorized users can delete documents.
   *
   * @param id The unique identifier of the execution from which the document will be removed.
   * @param documentId The unique identifier of the document to be removed.
   * @returns An object indicating whether the document removal was successful.
   */
  @Tags("Execution")
  @SuccessResponse("200", "OK")
  @Delete("{id}/documents/{documentId}")
  @Security("jwtToken", ["Tenant", "Execution:Update"])
  public async removeDocument(@Request() request: ContextualRequest, @Path() documentId: number): Promise<{ removed: boolean }> {
    const { context } = request;
    return await context.services.document.removeDocument(context, documentId);
  }

  /**
   * Deletes all documents of a specific type associated with a execution by its ID.
   * This endpoint is protected by JWT authentication, requiring "Execution:DeleteDocument" permission.
   *
   * @param id The unique identifier of the execution.
   * @param type The type of documents to remove.
   * @returns An object indicating whether the deletion of documents was successful.
   */
  @Tags("Execution")
  @SuccessResponse("200", "OK")
  @Delete("{id}/documents-by-type")
  @Security("jwtToken", ["Tenant", "Execution:Update"])
  public async removeDocuments(@Request() request: ContextualRequest, @Path() id: number, @Query() type: DocumentType,): Promise<{ removed: boolean }> {
    const { context } = request;
    return await context.services.document.removeDocuments(context, id, "execution", type);
  }
}