import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put } from "tsoa";
import type { Role, SetRolePermissionsProperties } from "../models/interfaces/role";
import type { ContextualRequest } from "../types";

@Route("roles")
export class RoleController extends Controller {
  /**
   * Retrieves a list of roles.
   * This method is secured with a JWT token and requires the "Role:List" permission.
   * It is intended to provide a list of all available roles in the system.
   *
   * @returns A promise that resolves to an array of Role objects, each representing a role in the system.
   *          The roles are returned as partial objects, implying that they may not contain all role properties.
   */
  @Tags("Role")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tenant", "Permission:List"])
  public async getRoles(@Request() request: ContextualRequest): Promise<Array<Partial<Role>>> {
    const { context, user } = request;
    return await context.services.role.getRoles(context, user.tenant);
  }

  /**
   * Retrieves a list of role permissions.
   * This method is secured with a JWT token and requires the "Role:List" permission.
   * It is intended to provide a list of all available role permissions in the system.
   *
   * @returns A promise that resolves to an array of Role objects, each representing a role permission in the system.
   *          The role permissions are returned as partial objects, implying that they may not contain all properties.
   */
  @Tags("Role")
  @SuccessResponse("200", "OK")
  @Get("/permissions")
  @Security("jwtToken", ["Tenant", "Permission:List"])
  public async getPermissions(@Request() request: ContextualRequest): Promise<Array<Partial<Role>>> {
    const { context, user } = request;
    return await context.services.role.getPermissions(context, user.tenant);
  }

  /**
   * Updates role permissions.
   * This method is secured with a JWT token and requires the "Role:List" permission.
   * It is intended to update the permissions of one or more roles in the system.
   *
   * @param body An array of objects representing role permissions to be updated.
   * @returns A promise that resolves to an array of Role objects, each representing a role in the system after the update.
   *          The roles are returned as partial objects, implying that they may not contain all properties.
   */
  @Tags("Role")
  @SuccessResponse("200", "OK")
  @Put("/permissions")
  @Security("jwtToken", ["Tenant", "Permission:Update"])
  public async updatePermissions(@Request() request: ContextualRequest, @Body() body: SetRolePermissionsProperties[]): Promise<Array<Partial<Role>>> {
    const { context, user } = request;
    return await context.services.role.updatePermissions(context, user.tenant, body);
  }
}
