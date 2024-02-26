import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put, Path, Post, Delete } from "tsoa";
import type { CreateTenantProperties, Tenant } from "../models/interfaces/tenant";
import type { CreateProfilePictureProperties } from "../models/interfaces/profile-picture";
import type { ContextualRequest } from "../types";

@Route("tenants")
export class TenantController extends Controller {
  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tenant:List"])
  public async getTenants(@Request() request: ContextualRequest): Promise<Array<Partial<Tenant>>> {
    const { context } = request;
    return await context.services.tenant.getTenants(context);
  }

  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Tenant:Get"])
  public async getTenant(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Tenant> | null> {
    const { context } = request;
    return await context.services.tenant.getTenant(context, id);
  }

  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Tenant:Create"])
  public async createTenant(@Request() request: ContextualRequest, @Body() body: CreateTenantProperties): Promise<Partial<Tenant> | null> {
    const { context } = request;
    return await context.services.tenant.createTenant(context, body);
  }

  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("jwtToken", ["Tenant:Update"])
  public async updateTenant(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Tenant>): Promise<Partial<Tenant> | null> {
    const { context } = request;
    return await context.services.tenant.updateTenant(context, id, body);
  }

  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Put("{id}/logo")
  @Security("jwtToken", ["Tenant:Update"])
  public async updateLogo(@Request() request: ContextualRequest, @Body() body: CreateProfilePictureProperties, @Path() id: number): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.profilePicture.upload(context, id, user.tenant, body, "tenant");
  }

  @Tags("User")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["Tenant:Delete"])
  public async deleteTenants(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context } = request;
    return await context.services.tenant.deleteTenants(context, body);
  }

  @Tags("Tenant")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Tenant:Delete"])
  public async deleteTenant(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context } = request;
    return await context.services.tenant.deleteTenant(context, id);
  }
};
