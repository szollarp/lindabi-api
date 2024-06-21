import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put, Path, Post, Delete, Query } from "tsoa";
import type { ContextualRequest } from "../types";
import type { CreateTenderProperties, Tender } from "../models/interfaces/tender";
import { CreateDocumentProperties, Document } from "../models/interfaces/document";
import { Journey } from "../models/interfaces/journey";
import { CreateTenderItemProperties, TenderItem } from "../models/interfaces/tender-item";

@Route("tenders")
export class TenderController extends Controller {
  /**
   * Creates a new tender with the provided properties. This operation is secured and
   * requires a JWT token with "Tender:Create" permission.
   *
   * @param body The properties required to create a new tender.
   * @returns The newly created tender object with partial details, or null if creation fails.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Tender:Create"])
  public async createTender(@Request() request: ContextualRequest, @Body() body: CreateTenderProperties): Promise<Partial<Tender> | null> {
    const { context, user } = request;
    const tender = await context.services.tender.createTender(context, user.tenant, user, body);
    if (tender) {
      context.services.notification.sendTenderCreatedNotification(context, tender);
    }

    return tender;
  }


  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Post("/{id}/copy")
  @Security("jwtToken", ["Tender:Create"])
  public async copyTender(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Tender> | null> {
    const { context, user } = request;
    return await context.services.tender.copyTender(context, user, id);
  }

  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Post("/{id}/send")
  @Security("jwtToken", ["Tender:Create"])
  public async sendEmail(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { message: string }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.sendTenderViaEmail(context, user, id, body.message);
  }

  /**
   * Retrieves a list of all tenders within the system. This endpoint requires
   * authentication and is protected by JWT tokens with the "Tender:List" permission.
   *
   * @returns An array of tender objects with partial details to protect sensitive information.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tender:List"])
  public async getTenders(@Request() request: ContextualRequest): Promise<Partial<Tender>[]> {
    const { context, user } = request;
    return await context.services.tender.getTenders(context, user.tenant);
  }

  /**
   * Retrieves detailed information about a specific tender by their ID.
   * This endpoint is protected by JWT authentication, requiring "Tender:Get" permission.
   *
   * @param id The unique identifier of the tender to retrieve.
   * @returns A tender object containing partial information, or null if no tender is found. 
   * Sensitive information is omitted.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Tenant", "Tender:Get"])
  public async getTender(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Tender> | null> {
    const { context, user } = request;
    return await context.services.tender.getTender(context, user.tenant, id);
  }

  /**
   * Retrieves detailed information about a specific tender by their ID.
   * This endpoint is protected by JWT authentication, requiring "Tender:Get" permission.
   *
   * @param id The unique identifier of the tender to retrieve.
   * @returns A tender object containing partial information, or null if no tender is found. 
   * Sensitive information is omitted.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Get("/{id}/items")
  @Security("jwtToken", ["Tenant", "Tender:Get"])
  public async getTenderItems(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<TenderItem>[]> {
    const { context, user } = request;
    return await context.services.tender.getTenderItems(context, user.tenant, id);
  }

  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Post("/{id}/items")
  @Security("jwtToken", ["Tenant", "Tender:Get"])
  public async addTenderItem(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateTenderItemProperties): Promise<Partial<TenderItem>> {
    const { context, user } = request;
    return await context.services.tender.createTenderItem(context, id, user, body);
  }

  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Put("/{id}/items/{itemId}")
  @Security("jwtToken", ["Tenant", "Tender:Update"])
  public async updateTenderItem(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number, @Body() body: Partial<TenderItem>): Promise<Partial<TenderItem | null>> {
    const { context, user } = request;
    return await context.services.tender.updateTenderItem(context, id, itemId, user, body);
  }

  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/items/{itemId}")
  @Security("jwtToken", ["Tenant", "Tender:Update"])
  public async removeTenderItem(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number): Promise<{ success: boolean }> {
    const { context } = request;
    return await context.services.tender.removeTenderItem(context, id, itemId);
  }

  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Put("/{id}/items-copy/{targetTenderId}")
  @Security("jwtToken", ["Tenant", "Tender:Update"])
  public async copyTenderItem(@Request() request: ContextualRequest, @Path() id: number, @Path() targetTenderId: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.copyTenderItem(context, id, targetTenderId, user);
  }

  /**
   * Retrieves detailed information about a specific tender documents by their ID.
   * This endpoint is protected by JWT authentication, requiring "Tender:Get" permission.
   *
   * @param id The unique identifier of the tender to retrieve.
   * @returns A tender documents objects containing partial information, or null if no documents is found. 
   * Sensitive information is omitted.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Get("{id}/documents")
  @Security("jwtToken", ["Tenant", "Tender:Get"])
  public async getTenderDocuments(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Document>[]> {
    const { context } = request;
    return await context.services.tender.getTenderDocuments(context, id);
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
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Get("{id}/documents/{documentId}")
  @Security("jwtToken", ["Tenant", "Tender:Get"])
  public async getTenderDocument(@Request() request: ContextualRequest, @Path() id: number, @Path() documentId: number): Promise<Partial<Document> | null> {
    const { context } = request;
    return await context.services.tender.getTenderDocument(context, id, documentId);
  }

  /**
   * Retrieves journey information associated with a specific tender by its ID.
   * This endpoint is protected by JWT authentication, requiring "Tender:Get" permission.
   *
   * @param id The unique identifier of the tender.
   * @returns An array of journey objects containing partial information.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Get("{id}/journeys")
  @Security("jwtToken", ["Tenant", "Tender:Get"])
  public async getTenderJourneys(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Journey>[]> {
    const { context } = request;
    return await context.services.tender.getTenderJourneys(context, id);
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
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Put("{id}/documents")
  @Security("jwtToken", ["Tenant", "Tender:Update"])
  public async uploadTenderDocuments(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateDocumentProperties[]): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.tender.uploadTenderDocuments(context, id, user, body);
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
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Delete("{id}/documents/{documentId}")
  @Security("jwtToken", ["Tenant", "Tender:Update"])
  public async removeTenderDocument(@Request() request: ContextualRequest, @Path() id: number, @Path() documentId: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.removeTenderDocument(context, id, user, documentId);
  }

  /**
   * Deletes all documents of a specific type associated with a tender by its ID.
   * This endpoint is protected by JWT authentication, requiring "Tender:Update" permission.
   *
   * @param id The unique identifier of the tender.
   * @param type The type of documents to remove.
   * @returns An object indicating whether the deletion of documents was successful.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Delete("{id}/documents-by-type")
  @Security("jwtToken", ["Tenant", "Tender:Update"])
  public async removeAllTenderDocuments(@Request() request: ContextualRequest, @Path() id: number, @Query() type: string,): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.removeAllTenderDocuments(context, id, user, type);
  }



  /**
   * Updates the information of an existing tender, identified by their ID. Access to this
   * endpoint is restricted to authenticated requests with "Tender:Update" permission.
   *
   * @param id The unique identifier of the tender to update.
   * @param body A partial tender object containing the fields to update.
   * @returns The updated tender object with partial details, or null if the update fails.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Put("{id}")
  @Security("jwtToken", ["Tenant:Update"])
  public async updateTender(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Tender>): Promise<Partial<Tender> | null> {
    const { context, user } = request;
    const data = await context.services.tender.updateTender(context, id, user, body);
    if (data.statusChanged && data.tender?.id && data.status) {
      context.services.notification.sendTenderStatusChangedNotification(context, data.tender.id!, data.status);
    }

    return data.tender;
  }

  /**
   * Deletes multiple tenders based on the provided array of IDs. This operation requires
   * authentication and "Tender:Delete" permission. The deletion affects only the tenders
   * associated with the authenticated user's tenant.
   *
   * @param body An object containing an array of tender IDs to delete.
   * @returns An object indicating the success of the deletion operation.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["Tenant", "Tender:Delete"])
  public async deleteTenders(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.deleteTenders(context, user.tenant, body);
  }

  /**
   * Deletes a single tender identified by their ID. This endpoint is secured with JWT authentication
   * and requires "Tender:Delete" permission. The operation is restricted to tenders within the
   * authenticated user's tenant.
   *
   * @param id The ID of the tender to delete.
   * @returns An object indicating whether the deletion was successful.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Tenant", "Tender:Delete"])
  public async deleteTender(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.deleteTender(context, user.tenant, id);
  }
}