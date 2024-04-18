import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete
} from "tsoa";
import type { CreateLocationProperties, Location } from "../models/interfaces/location";
import type { ContextualRequest } from "../types";

@Route("locations")
export class LocationController extends Controller {
  /**
 * Retrieves a list of locations associated with the authenticated user's tenant.
 * Requires a valid JWT token with "Location:List" permission. 
 *
 * This method returns a list of location objects, each containing partial information about a location.
 *
 * @returns An array of location objects with partial details.
 */
  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Location:List"])
  public async getLocations(@Request() request: ContextualRequest): Promise<Array<Partial<Location>>> {
    const { context, user } = request;
    return await context.services.location.getLocations(context, user.tenant);
  }

  /**
   * Fetches detailed information about a specific location identified by its ID. 
   * Requires JWT authentication with "Location:Get" permission.
   *
   * @param id The unique identifier of the location to retrieve.
   * @returns A location object with partial details, or null if not found.
   */
  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Location:Get"])
  public async getLocation(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Location> | null> {
    const { context, user } = request;
    return await context.services.location.getLocation(context, user.tenant, id);
  }

  /**
   * Creates a new location with the provided properties under the authenticated user's tenant. 
   * A valid JWT token with "Location:Create" permission is required.
   *
   * @param body The properties to create a new location.
   * @returns The newly created location object with partial details, or null if creation fails.
   */
  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Location:Create"])
  public async createLocation(@Request() request: ContextualRequest, @Body() body: CreateLocationProperties): Promise<Partial<Location> | null> {
    const { context, user } = request;
    return await context.services.location.createLocation(context, user.tenant, user.id, body);
  }

  /**
   * Updates an existing location identified by its ID with the provided properties. 
   * This operation requires JWT authentication and "Location:Update" permission.
   *
   * @param id The unique identifier of the location to update.
   * @param body The properties to update in the location.
   * @returns The updated location object with partial details, or null if the update fails.
   */
  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("jwtToken", ["Location:Update"])
  public async updateLocation(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Location>): Promise<Partial<Location> | null> {
    const { context, user } = request;
    return await context.services.location.updateLocation(context, user.tenant, id, user.id, body);
  }

  /**
   * Deletes multiple locations based on the provided array of IDs. 
   * Requires a valid JWT token with "Location:Delete" permission.
   *
   * @param body An object containing an array of location IDs to delete.
   * @returns An object indicating the success of the deletion operation.
   */
  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["Location:Delete"])
  public async deleteLocations(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.location.deleteLocations(context, user.tenant, body);
  }

  /**
   * Deletes a specific location identified by its ID. 
   * This endpoint requires JWT authentication and "Location:Delete" permission.
   *
   * @param id The ID of the location to delete.
   * @returns An object indicating whether the deletion was successful.
   */
  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Location:Delete"])
  public async deleteLocation(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.location.deleteLocation(context, user.tenant, id);
  }

  /**
   * Associates a location with a company by adding the location to the company's list of locations. 
   * Requires a valid JWT token with "Location:Create" permission.
   *
   * @param body An object containing the ID of the location to add to a company.
   * @returns An object indicating whether the operation was successful.
   */
  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Post("{id}/add-to-company")
  @Security("jwtToken", ["Location:Create"])
  public async addToCompany(@Request() request: ContextualRequest, @Body() body: { id: number }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.location.addToCompany(context, user.tenant, user.id, body);
  }
};
