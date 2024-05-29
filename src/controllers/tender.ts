import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put, Path, Post, Delete } from "tsoa";
import type { ContextualRequest } from "../types";
import type { Tender } from "../models/interfaces/tender";

@Route("tenders")
export class TenderController extends Controller {
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
  public async getTenders(@Request() request: ContextualRequest): Promise<Array<Partial<Tender>>> {
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