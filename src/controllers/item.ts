import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Post, Path, Body, Put, Delete } from "tsoa";
import type { ContextualRequest } from "../types";
import { CreateItemProperties, Item } from "../models/interfaces/item";

@Route("items")
export class ItemController extends Controller {
  /**
  * Retrieves a list of locations associated with the authenticated user's tenant.
  * Requires a valid JWT token with "Location:List" permission. 
  *
  * This method returns a list of item objects, each containing partial information about an item.
  *
  * @returns An array of item objects with partial details.
  */
  @Tags("Item")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant"])
  public async getItems(@Request() request: ContextualRequest): Promise<Array<Partial<Item>>> {
    const { context, user } = request;
    return await context.services.item.getItems(context, user.tenant);
  }

  /**
   * Fetches detailed information about a specific item identified by its ID.
   * Requires JWT authentication with "Item:Get" permission.
   *
   * @param id The unique identifier of the item to retrieve.
   * @returns An item object with partial details, or null if not found.
   */
  @Tags("Item")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("authentication", ["Tenant", "Item:List"])
  public async getItem(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Item> | null> {
    const { context, user } = request;
    return await context.services.item.getItem(context, user.tenant, id);
  }

  /**
   * Creates a new item with the provided properties under the authenticated user's tenant.
   * A valid JWT token with "Item:Create" permission is required.
   *
   * @param body The properties to create a new item.
   * @returns The newly created item object with partial details, or null if creation fails.
   */
  @Tags("Item")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant", "Item:Create"])
  public async createItem(@Request() request: ContextualRequest, @Body() body: CreateItemProperties): Promise<Partial<Item> | null> {
    const { context, user } = request;
    return await context.services.item.createItem(context, user.tenant, user.id, body);
  }

  /**
   * Updates an existing item identified by its ID with the provided properties.
   * This operation requires JWT authentication and "Item:Update" permission.
   *
   * @param id The unique identifier of the item to update.
   * @param body The properties to update in the item.
   * @returns The updated item object with partial details, or null if the update fails.
   */
  @Tags("Item")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("authentication", ["Tenant", "Item:Update"])
  public async updateItem(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Item>): Promise<Partial<Item> | null> {
    const { context, user } = request;
    return await context.services.item.updateItem(context, user.tenant, id, user.id, body);
  }

  /**
   * Deletes multiple items based on the provided array of IDs.
   * Requires a valid JWT token with "Item:Delete" permission.
   *
   * @param body An object containing an array of item IDs to delete.
   * @returns An object indicating the success of the deletion operation.
   */
  @Tags("Item")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("authentication", ["Tenant", "Item:Delete"])
  public async deleteItems(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.item.deleteItems(context, user.tenant, body);
  }

  /**
   * Deletes a specific warehouse identified by its ID.
   * This endpoint requires JWT authentication and "Warehouse:Delete" permission.
   *
   * @param id The ID of the warehouse to delete.
   * @returns An object indicating whether the deletion was successful.
   */
  @Tags("Item")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("authentication", ["Tenant", "Item:Delete"])
  public async deleteItem(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.item.deleteItem(context, user.tenant, id);
  }
}