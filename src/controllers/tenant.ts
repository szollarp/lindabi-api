import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put, Path, Post, Delete, UploadedFiles } from "tsoa";
import type { CreateTenantProperties, Tenant } from "../models/interfaces/tenant";
import type { ContextualRequest } from "../types";
import { CreateDocumentProperties } from "../models/interfaces/document";

@Route("tenants")
export class TenantController extends Controller {
  /**
   * Retrieves a list of all tenants within the system. This endpoint requires
   * authentication and is protected by JWT tokens with the "Tenant:List" permission.
   *
   * @returns An array of tenant objects with partial details to protect sensitive information.
   */
  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant:List"])
  public async getTenants(@Request() request: ContextualRequest): Promise<Array<Partial<Tenant>>> {
    const { context } = request;
    return await context.services.tenant.getTenants(context);
  }

  /**
   * Fetches detailed information about a specific tenant, identified by their unique ID. 
   * Requires authentication and "Tenant:Get" permission for access.
   *
   * @param id The unique identifier of the tenant.
   * @returns A tenant object with partial details or null if the tenant does not exist.
   */
  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("authentication", ["Tenant:Get"])
  public async getTenant(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Tenant> | null> {
    const { context } = request;
    return await context.services.tenant.getTenant(context, id);
  }

  /**
   * Creates a new tenant with the provided properties. This operation is secured and
   * requires a JWT token with "Tenant:Create" permission.
   *
   * @param body The properties required to create a new tenant.
   * @returns The newly created tenant object with partial details, or null if creation fails.
   */
  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant:Create"])
  public async createTenant(@Request() request: ContextualRequest, @Body() body: CreateTenantProperties): Promise<Partial<Tenant> | null> {
    const { context } = request;
    return await context.services.tenant.createTenant(context, body);
  }

  /**
   * Updates the information of an existing tenant, identified by their ID. Access to this
   * endpoint is restricted to authenticated requests with "Tenant:Update" permission.
   *
   * @param id The unique identifier of the tenant to update.
   * @param body A partial tenant object containing the fields to update.
   * @returns The updated tenant object with partial details, or null if the update fails.
   */
  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("authentication", ["Tenant:Update"])
  public async updateTenant(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Tenant>): Promise<Partial<Tenant> | null> {
    const { context } = request;
    return await context.services.tenant.updateTenant(context, id, body);
  }

  /**
   * Uploads or updates a logo for a specific tenant.The endpoint requires authentication
   * and the "Tenant:Update" permission.The logo is associated with the tenant based on their ID.
   *
   * @param id The ID of the tenant to update the logo for.
   * @param body Contains the image data and metadata for the logo.
   * @returns An object indicating the success of the logo upload operation.
   */
  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Put("{id}/documents")
  @Security("authentication", ["Tenant:Update"])
  public async uploadDocuments(@Request() request: ContextualRequest, @Path() id: number, @UploadedFiles() files: Express.Multer.File[]): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.document.upload(context, user, id, "tenant", "logo", files, {}, true);
  }

  /**
   * Deletes multiple tenants based on an array of their IDs. This operation is protected and
   * requires "Tenant:Delete" permission. It affects only the tenants associated with the
   * authenticated user's context.
   *
   * @param body An object containing an array of tenant IDs to delete.
   * @returns An object indicating the success or failure of the deletion process.
   */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("authentication", ["Tenant:Delete"])
  public async deleteTenants(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context } = request;
    return await context.services.tenant.deleteTenants(context, body);
  }

  /**
   * Deletes a specific tenant identified by their ID. Access to this endpoint is restricted
   * to requests authenticated with a JWT token having "Tenant:Delete" permission.
   *
   * @param id The unique identifier of the tenant to delete.
   * @returns An object indicating whether the deletion was successful.
   */
  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("authentication", ["Tenant:Delete"])
  public async deleteTenant(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context } = request;
    return await context.services.tenant.deleteTenant(context, id);
  }
};
