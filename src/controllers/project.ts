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
import { ProjectComment } from "../models/interfaces/project-comment";

@Route("projects")
export class ProjectController extends Controller {
  /**
   * Creates a new project by copying details from an existing tender. This operation is secured with JWT and requires
   * "Project:Create" permission. It is typically used to transition a tender into a project phase.
   *
   * @param body The project creation details including reference to the tender and additional parameters.
   * @returns An object containing the ID of the newly created project.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/copy-from-tender")
  @Security("jwtToken", ["Tenant", "Project:Create"])
  public async createProject(@Request() request: ContextualRequest, @Body() body: CreateProjectBody): Promise<{ id: number }> {
    const { context, user } = request;
    return await context.services.project.copyFromTender(context, body, user);
  }

  /**
   * Updates an existing project identified by its ID. This method is secured with JWT and requires "Project:Update" permission,
   * allowing only authorized users to make changes to project details.
   *
   * @param id The unique identifier of the project to update.
   * @param body The partial updates to be applied to the project.
   * @returns An object indicating whether the project update was successful.
   */
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

  /**
   * Updates the contact information associated with a specific project. This method requires "Project:Update" permission
   * and is secured with JWT to ensure that only authorized personnel can modify project contact details.
   *
   * @param id The ID of the project.
   * @param cid The ID of the contact to update within the project.
   * @param body The new values for the contact's visibility and association flags.
   * @returns A promise resolving to nothing upon successful update.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/contacts/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateProjectContact(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number, @Body() body: { canShow: boolean, userContact: boolean }): Promise<void> {
    const { context, user } = request;
    return await context.services.project.updateProjectContact(context, user, id, cid, body);
  }

  /**
   * Adds a contact to a specific project identified by the project ID. This method is secured with JWT, requiring "Project:Update"
   * permission under the "Tenant" scope. This ensures that only users with the appropriate permissions within the tenant can add contacts to the project.
   *
   * @param id The unique identifier of the project to which the contact will be added.
   * @param body Contains the contactId of the contact to be added to the project.
   * @returns A promise resolving to nothing upon successful addition of the contact, indicating that the operation was executed without errors.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/contacts")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addProjectContact(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { contactId: number }): Promise<void> {
    const { context, user } = request;
    return await context.services.project.addProjectContact(context, user, id, body.contactId);
  }

  /**
   * Removes a contact from a project by their contact ID. This operation is secured with JWT and requires "Project:Update" permission,
   * ensuring that only authorized personnel can remove contacts from projects.
   *
   * @param id The ID of the project from which the contact will be removed.
   * @param cid The ID of the contact to remove.
   * @returns A promise resolving to nothing, indicating the contact has been successfully removed.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/contacts/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeProjectContact(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number): Promise<void> {
    const { context, user } = request;
    return await context.services.project.removeProjectContact(context, user, id, cid);
  }

  /**
   * Adds a supervisor to a project by their contact ID. This operation requires "Project:Update" permission
   * and is secured with JWT, ensuring that only authorized users can add supervisors to the project.
   *
   * @param id The ID of the project to which the supervisor will be added.
   * @param body Contains the ID of the contact to be added as a supervisor.
   * @returns A promise resolving to nothing upon successful addition.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/supervisors")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addProjectSupervisor(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { contactId: number }): Promise<void> {
    const { context, user } = request;
    return await context.services.project.addProjectSupervisor(context, user, id, body.contactId);
  }

  /**
   * Removes a supervisor from a project. This operation is secured with JWT and requires "Project:Update" permission,
   * ensuring that only authorized users can remove supervisors.
   *
   * @param id The ID of the project from which the supervisor will be removed.
   * @param cid The ID of the supervisor to remove.
   * @returns A promise resolving to nothing, indicating the supervisor has been successfully removed.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/supervisors/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeProjectSupervisor(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number): Promise<void> {
    const { context, user } = request;
    return await context.services.project.removeProjectSupervisor(context, user, id, cid);
  }

  /**
   * Retrieves a list of color attributes associated with projects. This method is useful for client applications
   * to fetch available colors for UI representations of project categories or statuses. It is secured with JWT,
   * requiring a general "Tenant" permission, which allows a broad range of users within the same tenant to access this information.
   *
   * @returns An array of strings, each representing a color code used in project attributes.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("/attributes/get-colors")
  @Security("jwtToken", ["Tenant"])
  public async getColors(@Request() request: ContextualRequest): Promise<string[]> {
    const { context, user } = request;
    return await context.services.project.getProjectColors(context, user.tenant);
  }

  /**
   * Adds a new milestone to a project identified by its ID. This method is secured with JWT and requires "Project:Update" permission,
   * allowing only authorized personnel to add milestones to the project.
   *
   * @param id The ID of the project to which the milestone will be added.
   * @param body The properties required to create a new milestone.
   * @returns An object indicating whether the milestone addition was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/milestones")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addMilestone(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateMilestoneProperties): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.addMilestone(context, user, id, body);
  }

  /**
   * Updates a milestone within a project, specified by the milestone's ID. This method is secured with JWT and requires "Project:Update" permission,
   * allowing only authorized users to modify milestone details.
   *
   * @param id The ID of the project containing the milestone.
   * @param mid The ID of the milestone to update.
   * @param body The partial details to update in the milestone.
   * @returns An object indicating whether the milestone update was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/milestones/{mid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateMilestone(@Request() request: ContextualRequest, @Path() id: number, @Path() mid: number, @Body() body: Partial<Milestone>): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.updateMilestone(context, user, id, mid, body);
  }

  /**
   * Removes a milestone from a project, identified by the milestone's ID. This operation is secured with JWT and requires "Project:Update" permission,
   * ensuring that only authorized users can remove milestones.
   *
   * @param id The ID of the project from which the milestone will be removed.
   * @param mid The ID of the milestone to remove.
   * @returns An object indicating whether the milestone removal was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/milestones/{mid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeMilestone(@Request() request: ContextualRequest, @Path() id: number, @Path() mid: number): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.removeMilestone(context, user, id, mid);
  }

  /**
   * Removes a document from a specific milestone within a project. This method is secured with JWT and requires "Project:Update" permission,
   * ensuring that only authorized users can delete milestone documents.
   *
   * @param mid The milestone ID from which the document will be removed.
   * @param did The document ID to be removed.
   * @returns An object indicating whether the document was successfully removed.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/milestones/{mid}/documents/{did}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeMilestoneDocument(@Request() request: ContextualRequest, @Path() mid: number, @Path() did: number): Promise<{ removed: boolean }> {
    const { context, user } = request;
    return await context.services.document.remove(context, mid, did, "milestone");
  }

  /**
   * Retrieves a specific document from a milestone within a project. This method is secured with JWT and requires "Project:Get" permission,
   * ensuring that only authorized users can access milestone documents.
   *
   * @param mid The milestone ID from which the document will be retrieved.
   * @param did The document ID to retrieve.
   * @returns A partial document object or null if the document is not found.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("/{id}/milestones/{mid}/documents/{did}")
  @Security("jwtToken", ["Tenant", "Project:Get"])
  public async getMilestoneDocument(@Request() request: ContextualRequest, @Path() mid: number, @Path() did: number): Promise<Partial<Document> | null> {
    const { context, user } = request;
    return await context.services.document.get(context, mid, did, "milestone");
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

  /**
   * Updates the order of an item within a project. This method is secured with JWT and requires "Project:Update" permission,
   * allowing authorized users to adjust the order of project items.
   *
   * @param id The project ID containing the item.
   * @param itemId The ID of the project item to reorder.
   * @param body Contains the direction to move the item (up or down).
   * @returns An object indicating whether the reorder was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/items/{itemId}/order")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateProjectItemOrder(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number, @Body() body: { side: "up" | "down" }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.project.updateProjectItemOrder(context, id, itemId, user, body);
  }

  /**
   * Removes an item from a project. This operation requires JWT authentication and is secured with "Project:Update" permission,
   * ensuring that only authorized personnel can remove project items.
   *
   * @param id The unique identifier of the project from which the item will be removed.
   * @param itemId The unique identifier of the item to be removed.
   * @returns An object indicating whether the item removal was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/items/{itemId}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeProjectItem(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.project.removeProjectItem(context, user, id, itemId);
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

  /**
   * Adds a comment to a project. This operation is secured with JWT and requires "Project:Update" permission,
   * ensuring that only authorized users can add comments to the project.
   *
   * @param id The ID of the project to which the comment will be added.
   * @param body Contains the comment text.
   * @returns An object indicating whether the addition of the comment was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/comments")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addComment(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { notes: string }): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.addComment(context, user, id, body);
  }

  /**
   * Updates a comment in a project. This operation is secured with JWT and requires "Project:Update" permission,
   * allowing only authorized users to modify project comments.
   *
   * @param id The ID of the project containing the comment.
   * @param cid The ID of the comment to update.
   * @param body Contains the partial update data for the comment.
   * @returns An object indicating whether the update was successful.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/comments/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateComment(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number, @Body() body: Partial<ProjectComment>): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.updateComment(context, user, id, cid, body);
  }

  /**
   * Removes a comment from a project. This method is secured with JWT and requires "Project:Update" permission,
   * ensuring that only authorized users can remove comments.
   *
   * @param id The ID of the project from which the comment will be removed.
   * @param cid The ID of the comment to be removed.
   * @returns An object indicating whether the comment was successfully removed.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/comments/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeComment(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.removeComment(context, user, id, cid);
  }
}