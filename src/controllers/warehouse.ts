import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Post, Path, Body, Put, Delete } from "tsoa";
import type { ContextualRequest } from "../types";

import { CreateWarehouseProperties, Warehouse } from "../models/interfaces/warehouse";

@Route("warehouses")
export class WarehouseController extends Controller {
  /**
  * Retrieves a list of locations associated with the authenticated user's tenant.
  * Requires a valid JWT token with "Location:List" permission. 
  *
  * This method returns a list of warehouse objects, each containing partial information about a warehouse.
  *
  * @returns An array of warehouse objects with partial details.
  */
  @Tags("Warehouse")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant"])
  public async getWarehouses(@Request() request: ContextualRequest): Promise<Array<Partial<Warehouse>>> {
    const { context, user } = request;
    return await context.services.warehouse.getWarehouses(context, user.tenant);
  }

  /**
   * Fetches detailed information about a specific warehouse identified by its ID.
   * Requires JWT authentication with "Warehouse:Get" permission.
   *
   * @param id The unique identifier of the warehouse to retrieve.
   * @returns A warehouse object with partial details, or null if not found.
   */
  @Tags("Warehouse")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("authentication", ["Tenant", "Warehouse:Get"])
  public async getWarehouse(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Warehouse> | null> {
    const { context, user } = request;
    return await context.services.warehouse.getWarehouse(context, user.tenant, id);
  }

  /**
   * Creates a new warehouse with the provided properties under the authenticated user's tenant.
   * A valid JWT token with "Warehouse:Create" permission is required.
   *
   * @param body The properties to create a new warehouse.
   * @returns The newly created warehouse object with partial details, or null if creation fails.
   */
  @Tags("Warehouse")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant", "Warehouse:Create"])
  public async createWarehouse(@Request() request: ContextualRequest, @Body() body: CreateWarehouseProperties): Promise<Partial<Warehouse> | null> {
    const { context, user } = request;
    return await context.services.warehouse.createWarehouse(context, user.tenant, user.id, body);
  }

  /**
   * Updates an existing warehouse identified by its ID with the provided properties.
   * This operation requires JWT authentication and "Warehouse:Update" permission.
   *
   * @param id The unique identifier of the warehouse to update.
   * @param body The properties to update in the warehouse.
   * @returns The updated warehouse object with partial details, or null if the update fails.
   */
  @Tags("Warehouse")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("authentication", ["Tenant", "Warehouse:Update"])
  public async updateWarehouse(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Warehouse>): Promise<Partial<Warehouse> | null> {
    const { context, user } = request;
    return await context.services.warehouse.updateWarehouse(context, user.tenant, id, user.id, body);
  }

  /**
   * Deletes multiple warehouses based on the provided array of IDs.
   * Requires a valid JWT token with "Warehouse:Delete" permission.
   *
   * @param body An object containing an array of warehouse IDs to delete.
   * @returns An object indicating the success of the deletion operation.
   */
  @Tags("Warehouse")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("authentication", ["Tenant", "Warehouse:Delete"])
  public async deleteWarehouses(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.warehouse.deleteWarehouses(context, user.tenant, body);
  }

  /**
   * Deletes a specific warehouse identified by its ID.
   * This endpoint requires JWT authentication and "Warehouse:Delete" permission.
   *
   * @param id The ID of the warehouse to delete.
   * @returns An object indicating whether the deletion was successful.
   */
  @Tags("Warehouse")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("authentication", ["Tenant", "Warehouse:Delete"])
  public async deleteWarehouse(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.warehouse.deleteWarehouse(context, user.tenant, id);
  }
}