import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put, Query } from "tsoa";
import type { Role, SetRolePermissionsProperties } from "../models/interfaces/role";
import type { ContextualRequest } from "../types";

@Route("search")
export class SearchController extends Controller {
  /**
   * Retrieves a list of all tenants within the system. This endpoint requires
   * authentication and is protected by JWT tokens with the "Tenant:List" permission.
   *
   * @returns An array of tenant objects with partial details to protect sensitive information.
   */
  @Tags("Search")
  @SuccessResponse("200", "OK")
  @Put("/global")
  @Security("authentication", [])
  public async search(@Request() request: ContextualRequest, @Body() body: { keyword: string }): Promise<any> {
    const { context } = request;
    return await context.services.search.globalSearch(context, body);
  }
}