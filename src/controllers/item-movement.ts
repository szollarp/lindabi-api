import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Post, Path, Body, Put, Delete, Query } from "tsoa";
import type { ContextualRequest } from "../types";
import { CreateItemMovementProperties, ItemMovement, UpdateItemMovementProperties } from "../models/interfaces/item-movement";

@Route("item-movements")
export class ItemMovementController extends Controller {
  /**
   * Retrieves a list of item movements for the authenticated user's tenant.
   * Requires a valid JWT token with "InventoryTransaction:List" permission.
   *
   * @param page Page number for pagination (default: 1)
   * @param limit Number of items per page (default: 10)
   * @param type Filter by movement type (issue, return, transfer)
   * @param itemId Filter by specific item ID
   * @param source Filter by source type (warehouse, project)
   * @param target Filter by target type (warehouse, project)
   * @param employeeId Filter by employee ID
   * @param startDate Filter by start date (ISO string)
   * @param endDate Filter by end date (ISO string)
   * @returns A paginated list of item movements with related data
   */
  @Tags("ItemMovement")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant", "InventoryTransaction:List"])
  public async getItemMovements(
    @Request() request: ContextualRequest,
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() type?: 'issue' | 'return' | 'transfer',
    @Query() itemId?: number,
    @Query() source?: 'warehouse' | 'project',
    @Query() target?: 'warehouse' | 'project',
    @Query() employeeId?: number,
    @Query() startDate?: string,
    @Query() endDate?: string
  ): Promise<{ data: ItemMovement[], total: number, page: number, limit: number }> {
    const { context, user } = request;
    const filters = {
      type,
      itemId,
      source,
      target,
      employeeId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    };
    return await context.services.itemMovement.getItemMovements(context, user.tenant, page, limit, filters);
  }

  /**
   * Fetches detailed information about a specific item movement identified by its ID.
   * Requires JWT authentication with "InventoryTransaction:Get" permission.
   *
   * @param id The unique identifier of the item movement to retrieve.
   * @returns An item movement object with full details, or null if not found.
   */
  @Tags("ItemMovement")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("authentication", ["Tenant", "InventoryTransaction:Get"])
  public async getItemMovement(@Request() request: ContextualRequest, @Path() id: number): Promise<ItemMovement | null> {
    const { context, user } = request;
    return await context.services.itemMovement.getItemMovement(context, user.tenant, id);
  }

  /**
   * Creates item movements with the provided properties under the authenticated user's tenant.
   * A valid JWT token with "InventoryTransaction:Create" permission is required.
   * Items are always provided as an array, even for single item transactions.
   *
   * @param body The properties to create item movements, with items as an array.
   * @returns Array of created item movements.
   */
  @Tags("ItemMovement")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant", "InventoryTransaction:Create"])
  public async createItemMovements(
    @Request() request: ContextualRequest,
    @Body() body: CreateItemMovementProperties
  ): Promise<ItemMovement[]> {
    const { context, user } = request;
    return await context.services.itemMovement.createItemMovements(context, user.tenant, user.id, body);
  }

  /**
   * Updates an existing item movement with the provided properties.
   * Requires JWT authentication with "InventoryTransaction:Update" permission.
   *
   * @param id The unique identifier of the item movement to update.
   * @param body The properties to update the item movement.
   * @returns The updated item movement object with full details, or null if not found.
   */
  @Tags("ItemMovement")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("authentication", ["Tenant", "InventoryTransaction:Update"])
  public async updateItemMovement(
    @Request() request: ContextualRequest,
    @Path() id: number,
    @Body() body: UpdateItemMovementProperties
  ): Promise<ItemMovement | null> {
    const { context, user } = request;
    return await context.services.itemMovement.updateItemMovement(context, user.tenant, id, user.id, body);
  }

  /**
   * Deletes an item movement by its ID.
   * Requires JWT authentication with "InventoryTransaction:Delete" permission.
   *
   * @param id The unique identifier of the item movement to delete.
   * @returns A success indicator object.
   */
  @Tags("ItemMovement")
  @SuccessResponse("200", "OK")
  @Delete("/{id}")
  @Security("authentication", ["Tenant", "InventoryTransaction:Delete"])
  public async deleteItemMovement(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.itemMovement.deleteItemMovement(context, user.tenant, id);
  }


  /**
   * Gets item movements for a specific entity (warehouse or project).
   * Requires JWT authentication with "InventoryTransaction:List" permission.
   *
   * @param entityType The type of entity (warehouse or project)
   * @param entityId The ID of the entity
   * @param page Page number for pagination (default: 1)
   * @param limit Number of items per page (default: 10)
   * @returns A paginated list of item movements for the entity
   */
  @Tags("ItemMovement")
  @SuccessResponse("200", "OK")
  @Get("/entity/{entityType}/{entityId}")
  @Security("authentication", ["Tenant", "InventoryTransaction:List"])
  public async getItemMovementsByEntity(
    @Request() request: ContextualRequest,
    @Path() entityType: 'warehouse' | 'project',
    @Path() entityId: number,
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<{ data: ItemMovement[], total: number, page: number, limit: number }> {
    const { context, user } = request;
    return await context.services.itemMovement.getItemMovementsByEntity(context, user.tenant, entityType, entityId, page, limit);
  }
}
