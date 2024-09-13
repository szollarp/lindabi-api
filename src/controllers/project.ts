import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete,
  Query
} from "tsoa";
import type { ContextualRequest } from "../types";
import { CreateProjectBody, Project } from "../models/interfaces/project";
import { CreateMilestoneProperties, Milestone } from "../models/interfaces/milestone";
import { CreateProjectItemProperties, ProjectItem } from "../models/interfaces/project-item";
import { CreateDocumentProperties, Document } from "../models/interfaces/document";
import { Journey } from "../models/interfaces/journey";

@Route("projects")
export class ProjectController extends Controller {

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/copy-from-tender")
  @Security("jwtToken", ["Tenant", "Project:Create"])
  public async createProject(@Request() request: ContextualRequest, @Body() body: CreateProjectBody): Promise<{ id: number }> {
    const { context, user } = request;
    return await context.services.project.copyFromTender(context, body, user);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateProject(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Project>): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.updateProject(context, id, body, user);
  }

  /**
   * Retrieves a list of all projects within the system. This endpoint requires
   * authentication and is protected by JWT tokens with the "Project:List" permission.
   *
   * @returns An array of project objects with partial details to protect sensitive information.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Project:List"])
  public async getProjects(@Request() request: ContextualRequest): Promise<Partial<Project>[]> {
    const { context, user } = request;
    console.log({ user })
    return await context.services.project.getProjects(context, user);
  }

  /**
   * Retrieves detailed information about a specific project by their ID.
   * This endpoint is protected by JWT authentication, requiring "Project:Get" permission.
   *
   * @param id The unique identifier of the project to retrieve.
   * @returns A project object containing partial information, or null if no project is found. 
   * Sensitive information is omitted.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async getProject(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Project> | null> {
    const { context, user } = request;
    return await context.services.project.getProject(context, user.tenant, id);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/contacts/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateProjectContact(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number, @Body() body: { canShow: boolean, userContact: boolean }): Promise<void> {
    const { context, user } = request;
    return await context.services.project.updateProjectContact(context, user, id, cid, body);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/contacts")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addProjectContact(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { contactId: number }): Promise<void> {
    const { context, user } = request;
    return await context.services.project.addProjectContact(context, user, id, body.contactId);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/contacts/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeProjectContact(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number): Promise<void> {
    const { context, user } = request;
    return await context.services.project.removeProjectContact(context, user, id, cid);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/supervisors")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addProjectSupervisor(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { contactId: number }): Promise<void> {
    const { context, user } = request;
    return await context.services.project.addProjectSupervisor(context, user, id, body.contactId);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/supervisors/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeProjectSupervisor(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number): Promise<void> {
    const { context, user } = request;
    return await context.services.project.removeProjectSupervisor(context, user, id, cid);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("/attributes/get-colors")
  @Security("jwtToken", ["Tenant"])
  public async getColors(@Request() request: ContextualRequest): Promise<string[]> {
    const { context, user } = request;
    return await context.services.project.getProjectColors(context, user.tenant);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/milestones")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addMilestone(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateMilestoneProperties): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.addMilestone(context, user, id, body);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/milestones/{mid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateMilestone(@Request() request: ContextualRequest, @Path() id: number, @Path() mid: number, @Body() body: Partial<Milestone>): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.updateMilestone(context, user, id, mid, body);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/milestones/{mid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeMilestone(@Request() request: ContextualRequest, @Path() id: number, @Path() mid: number): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.removeMilestone(context, user, id, mid);
  }

  /**
    * Adds a new item to an existing tender identified by its ID. This operation is secured with JWT and requires "Tender:Get" permission.
    * Useful for modifying tender details dynamically during the tender process.
    *
    * @param id The unique identifier of the tender to which the item will be added.
    * @param body The properties required to create the new tender item.
    * @returns The newly created tender item object with partial details, or null if the operation fails.
    */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/items")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addProjectItem(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateProjectItemProperties): Promise<Partial<ProjectItem>> {
    const { context, user } = request;
    return await context.services.project.createProjectItem(context, id, user, body);
  }

  /**
  * Updates a specific item within a tender by its item ID. This endpoint requires JWT authentication
  * and is protected by "Tender:Update" permission, ensuring that only authorized modifications are allowed.
  *
  * @param id The unique identifier of the tender containing the item.
  * @param itemId The unique identifier of the item to update.
  * @param body A partial tender item object containing the fields to update.
  * @returns The updated tender item object with partial details, or null if the update fails.
  */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/items/{itemId}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateProjectItem(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number, @Body() body: Partial<ProjectItem>): Promise<Partial<ProjectItem | null>> {
    const { context, user } = request;
    return await context.services.project.updateProjectItem(context, id, itemId, user, body);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/items/{itemId}/order")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateProjectItemOrder(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number, @Body() body: { side: "up" | "down" }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.project.updateProjectItemOrder(context, id, itemId, user, body);
  }

  /**
   * Removes a specific item from a tender by its item ID. This operation requires JWT authentication
   * and is secured with "Tender:Update" permission, designed to allow modifications only by authorized personnel.
   *
   * @param id The unique identifier of the tender from which the item will be removed.
   * @param itemId The unique identifier of the item to be removed.
   * @returns An object indicating whether the item removal was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/items/{itemId}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeProjectItem(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number): Promise<{ success: boolean }> {
    const { context } = request;
    return await context.services.project.removeProjectItem(context, id, itemId);
  }

  /**
   * Retrieves detailed information about a specific tender documents by their ID.
   * This endpoint is protected by JWT authentication, requiring "Tender:Get" permission.
   *
   * @param id The unique identifier of the tender to retrieve.
   * @returns A tender documents objects containing partial information, or null if no documents is found. 
   * Sensitive information is omitted.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("{id}/documents")
  @Security("jwtToken", ["Tenant", "Project:Get"])
  public async getDocuments(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Document>[]> {
    const { context } = request;
    return await context.services.project.getDocuments(context, id);
  }

  /**
   * Retrieves detailed information about a specific tender document by its document ID within a tender.
   * This endpoint is protected by JWT authentication, requiring "Tender:Get" permission.
   *
   * @param id The unique identifier of the tender.
   * @param documentId The unique identifier of the document to retrieve.
   * @returns A tender document object containing partial information, or null if no document is found.
   * Sensitive information is omitted.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("{id}/documents/{documentId}")
  @Security("jwtToken", ["Tenant", "Project:Get"])
  public async getDocument(@Request() request: ContextualRequest, @Path() id: number, @Path() documentId: number): Promise<Partial<Document> | null> {
    const { context } = request;
    return await context.services.project.getDocument(context, id, documentId);
  }

  /**
   * Retrieves journey information associated with a specific tender by its ID.
   * This endpoint is protected by JWT authentication, requiring "Tender:Get" permission.
   *
   * @param id The unique identifier of the tender.
   * @returns An array of journey objects containing partial information.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("{id}/journeys")
  @Security("jwtToken", ["Tenant", "Project:Get"])
  public async getJourneys(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Journey>[]> {
    const { context } = request;
    return await context.services.project.getJourneys(context, id);
  }

  /**
   * Upload documents for the specified tender by their ID.
   * This endpoint is protected by JWT authentication, requiring "Tender:Update" permission.
   *
   * @param id The unique identifier of the tender.
   * @param body A partial document objects containing the data to update.
   * @returns A tender documents objects containing partial information, or null if no documents is found. 
   * Sensitive information is omitted.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("{id}/documents")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async uploadDocuments(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateDocumentProperties[]): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.project.uploadDocuments(context, id, user, body);
  }

  /**
   * Removes a specific document from a tender by its document ID.
   * This endpoint requires JWT authentication and is protected with the "Tender:Update" permission,
   * ensuring that only authorized users can delete documents.
   *
   * @param id The unique identifier of the tender from which the document will be removed.
   * @param documentId The unique identifier of the document to be removed.
   * @returns An object indicating whether the document removal was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("{id}/documents/{documentId}")
  @Security("jwtToken", ["Tenant", "Tender:Update"])
  public async removeDocument(@Request() request: ContextualRequest, @Path() id: number, @Path() documentId: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.project.removeDocument(context, id, user, documentId);
  }

  /**
   * Deletes all documents of a specific type associated with a tender by its ID.
   * This endpoint is protected by JWT authentication, requiring "Tender:Update" permission.
   *
   * @param id The unique identifier of the tender.
   * @param type The type of documents to remove.
   * @returns An object indicating whether the deletion of documents was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("{id}/documents-by-type")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeProjectDocuments(@Request() request: ContextualRequest, @Path() id: number, @Query() type: string,): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.project.removeDocuments(context, id, user, type);
  }
}