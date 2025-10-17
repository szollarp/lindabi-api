import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put, Path, Post, Delete, Query, UploadedFiles, FormField, UploadedFile } from "tsoa";
import type { ContextualRequest } from "../types";
import type { CreateTenderProperties, Tender } from "../models/interfaces/tender";
import { DocumentType } from "../models/interfaces/document";
import { Journey } from "../models/interfaces/journey";
import { CreateTenderItemProperties, TenderItem } from "../models/interfaces/tender-item";
import { Op } from "sequelize";
import { TENDER_STATUS } from "../constants";

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
  @Security("authentication", ["Tenant", "Tender:Create"])
  public async createTender(@Request() request: ContextualRequest, @Body() body: CreateTenderProperties): Promise<Partial<Tender> | null> {
    const { context, user } = request;
    const tender = await context.services.tender.createTender(context, user.tenant, user, body);
    if (tender) {
      context.services.notification.sendTenderCreatedNotification(context, tender);
    }

    return tender;
  }

  /**
     * Copies an existing tender based on its ID. This operation is secured and
     * requires a JWT token with "Tender:Create" permission.
     *
     * @param id The unique identifier of the tender to be copied.
     * @returns The newly created copy of the tender with partial details, or null if the copy fails.
     */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Post("/{id}/copy")
  @Security("authentication", ["Tenant", "Tender:Create"])
  public async copyTender(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Tender> | null> {
    const { context, user } = request;
    return await context.services.tender.copyTender(context, user, id);
  }

  /**
   * Sends an email with details about a specific tender. Secured with a JWT token and requires "Tender:Create" permission.
   * This method is typically used for notifying stakeholders about tender updates or invitations to tender.
   *
   * @param id The unique identifier of the tender to send.
   * @param body Contains the message to be included in the email.
   * @returns An object indicating whether the email was successfully sent.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Post("/{id}/send")
  @Security("authentication", ["Tenant", "Tender:Create"])
  public async sendEmail(@Request() request: ContextualRequest, @Path() id: number, @FormField() message: string, @UploadedFile() content: File): Promise<{ success: boolean }> {
    const { context, user } = request;
    // const { message, content } = body;
    return await context.services.tender.sendTenderViaEmail(context, user, id, message, content);
  }

  /**
   * Retrieves a paginated list of all tenders within the system. This endpoint requires
   * authentication and is protected by JWT tokens with the "Tender:List" permission.
   *
   * @param page Page number for pagination (default: 1)
   * @param limit Number of items per page (default: 25)
   * @param status Filter by tender status
   * @param customerId Filter by customer ID
   * @param contractorId Filter by contractor ID
   * @param locationId Filter by location ID
   * @param contactId Filter by contact ID
   * @param startDate Filter by start date (ISO string)
   * @param endDate Filter by end date (ISO string)
   * @param keyword Search keyword for tender fields
   * @param orderBy Field to sort by (default: 'updatedOn')
   * @param order Sort order: 'asc' or 'desc' (default: 'desc')
   * @returns A paginated list of tender objects with partial details to protect sensitive information.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant", "Tender:List"])
  public async getTenders(
    @Request() request: ContextualRequest,
    @Query() page: number = 1,
    @Query() limit: number = 25,
    @Query() status?: string,
    @Query() customerId?: number,
    @Query() contractorId?: number,
    @Query() locationId?: number,
    @Query() contactId?: number,
    @Query() startDate?: string,
    @Query() endDate?: string,
    @Query() keyword?: string,
    @Query() orderBy?: string,
    @Query() order?: string
  ): Promise<{ data: Partial<Tender>[], total: number, page: number, limit: number }> {
    const { context, user } = request;

    const whereStatus = !status || status === "all" ? { [Op.ne]: TENDER_STATUS.ARCHIVED } : status as TENDER_STATUS;

    const filters = {
      status: whereStatus,
      customerId,
      contractorId,
      locationId,
      contactId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      keyword
    };

    const sortOptions = {
      orderBy: orderBy || 'updatedOn',
      order: (order === 'asc' || order === 'desc') ? order : 'desc' as 'asc' | 'desc'
    };

    return await context.services.tender.getTenders(context, user.tenant, page, limit, filters, sortOptions);
  }

  /**
   * Retrieves a list of all tenders within the system. This endpoint requires
   * authentication and is protected by JWT tokens with the "Tender:List" permission.
   *
   * @returns An array of tender objects with partial details to protect sensitive information.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Get("/basic")
  @Security("authentication", ["Tenant", "Tender:List"])
  public async getBasicTenders(@Request() request: ContextualRequest): Promise<Array<Partial<Tender>>> {
    const { context, user } = request;
    return await context.services.tender.getBasicTenders(context, user.tenant);
  }

  /**
   * Retrieves tender status counts for the dashboard analytics.
   * This endpoint requires authentication and is protected by JWT tokens with the "Tender:List" permission.
   *
   * @returns An object containing counts for each tender status.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Get("/status-counts")
  @Security("authentication", ["Tenant", "Tender:List"])
  public async getTenderStatusCounts(@Request() request: ContextualRequest): Promise<Record<string, number>> {
    const { context, user } = request;
    return await context.services.tender.getTenderStatusCounts(context, user.tenant);
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
  @Security("authentication", ["Tenant", "Tender:Get"])
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
  @Security("authentication", ["Tenant", "Tender:Get"])
  public async getTenderItems(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<TenderItem>[]> {
    const { context, user } = request;
    return await context.services.tender.getTenderItems(context, user.tenant, id);
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
  @Get("/{id}/related-items")
  @Security("authentication", ["Tenant", "Tender:Get"])
  public async getItemsByTenderType(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<TenderItem>[]> {
    const { context, user } = request;
    return await context.services.tender.getItemsByTenderType(context, user.tenant, id);
  }

  /**
    * Adds a new item to an existing tender identified by its ID. This operation is secured with JWT and requires "Tender:Get" permission.
    * Useful for modifying tender details dynamically during the tender process.
    *
    * @param id The unique identifier of the tender to which the item will be added.
    * @param body The properties required to create the new tender item.
    * @returns The newly created tender item object with partial details, or null if the operation fails.
    */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Post("/{id}/items")
  @Security("authentication", ["Tenant", "Tender:Get"])
  public async addTenderItem(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateTenderItemProperties): Promise<Partial<TenderItem>> {
    const { context, user } = request;
    return await context.services.tender.createTenderItem(context, id, user, body);
  }

  /**
   * Copies an existing tender item to another tender. This endpoint is protected by JWT authentication,
   * requiring "Tender:Update" permission. It allows users to duplicate tender items efficiently between tenders.
   *
   * @param id The unique identifier of the tender containing the item to copy.
   * @param targetTenderId The ID of the target tender where the item will be copied.
   * @returns An object indicating whether the item was successfully copied.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Put("/{sourceId}/items-copy/{targetId}")
  @Security("authentication", ["Tenant", "Tender:Update"])
  public async copyTenderItem(@Request() request: ContextualRequest, @Path() sourceId: number, @Path() targetId: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.copyTenderItem(context, sourceId, targetId, user);
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
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Put("/{id}/items/{itemId}")
  @Security("authentication", ["Tenant", "Tender:Update"])
  public async updateTenderItem(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number, @Body() body: Partial<TenderItem>): Promise<Partial<TenderItem | null>> {
    const { context, user } = request;
    return await context.services.tender.updateTenderItem(context, id, itemId, user, body);
  }

  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Put("/{id}/items/{itemId}/order")
  @Security("authentication", ["Tenant", "Tender:Update"])
  public async updateTenderItemOrder(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number, @Body() body: { side: "up" | "down" }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.updateTenderItemOrder(context, id, itemId, user, body);
  }

  /**
   * Removes a specific item from a tender by its item ID. This operation requires JWT authentication
   * and is secured with "Tender:Update" permission, designed to allow modifications only by authorized personnel.
   *
   * @param id The unique identifier of the tender from which the item will be removed.
   * @param itemId The unique identifier of the item to be removed.
   * @returns An object indicating whether the item removal was successful.
   */
  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/items/{itemId}")
  @Security("authentication", ["Tenant", "Tender:Update"])
  public async removeTenderItem(@Request() request: ContextualRequest, @Path() id: number, @Path() itemId: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.removeTenderItem(context, user, id, itemId);
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
  @Security("authentication", ["Tenant", "Tender:Get"])
  public async getTenderDocument(@Request() request: ContextualRequest, @Path() id: number, @Path() documentId: number): Promise<any> {
    const { context } = request;
    return await context.services.document.getDocument(context, documentId, id, "tender");
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
  @Security("authentication", ["Tenant", "Tender:Get"])
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
  @Security("authentication", ["Tenant", "Tender:Update"])
  public async uploadTenderDocuments(@Request() request: ContextualRequest, @Path() id: number, @Query() type: DocumentType, @UploadedFiles() files: Express.Multer.File[]): Promise<any> {
    const { context, user } = request;
    return await context.services.document.upload(context, user, id, "tender", type, files, {}, false);
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
  @Security("authentication", ["Tenant", "Tender:Update"])
  public async removeDocument(@Request() request: ContextualRequest, @Path() id: number, @Path() documentId: number): Promise<{ removed: boolean }> {
    const { context } = request;
    return await context.services.document.removeDocument(context, documentId);
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
  @Security("authentication", ["Tenant", "Tender:Update"])
  public async removeDocuments(@Request() request: ContextualRequest, @Path() id: number, @Query() type: DocumentType,): Promise<{ removed: boolean }> {
    const { context } = request;
    return await context.services.document.removeDocuments(context, id, "tender", type);
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
  @Security("authentication", ["Tender:Update"])
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
  @Security("authentication", ["Tenant", "Tender:Delete"])
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
  @Security("authentication", ["Tenant", "Tender:Delete"])
  public async deleteTender(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.tender.deleteTender(context, user.tenant, id);
  }
}