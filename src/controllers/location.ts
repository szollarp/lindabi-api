import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete
} from "tsoa";
import type { CreateLocationProperties, Location } from "../models/interfaces/location";
import type { ContextualRequest } from "../types";

@Route("locations")
export class LocationController extends Controller {
  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Location:List"])
  public async getLocations(@Request() request: ContextualRequest): Promise<Array<Partial<Location>>> {
    const { context, user } = request;
    return await context.services.location.getLocations(context, user.tenant);
  }

  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Location:Get"])
  public async getLocation(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Location> | null> {
    const { context, user } = request;
    return await context.services.location.getLocation(context, user.tenant, id);
  }

  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Location:Create"])
  public async createLocation(@Request() request: ContextualRequest, @Body() body: CreateLocationProperties): Promise<Partial<Location> | null> {
    const { context, user } = request;
    return await context.services.location.createLocation(context, user.tenant, user.id, body);
  }

  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("jwtToken", ["Location:Update"])
  public async updateLocation(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Location>): Promise<Partial<Location> | null> {
    const { context, user } = request;
    return await context.services.location.updateLocation(context, user.tenant, id, user.id, body);
  }

  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["Location:Delete"])
  public async deleteLocations(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.location.deleteLocations(context, user.tenant, body);
  }

  @Tags("Location")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Location:Delete"])
  public async deleteLocation(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.location.deleteLocation(context, user.tenant, id);
  }
};
