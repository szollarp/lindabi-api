import { Controller, Get, Route, Request, SuccessResponse, Tags } from "tsoa";
import type { ContextualRequest } from "../types";

@Route("healthz")
export class HealthController extends Controller {
  /**
 * Retrieves the API health status. This method is used for health checking
 * and indicates if the API is running and responsive.
 * A typical use case is in deployment environments for continuous monitoring
 * and readiness checks.
 * @returns A boolean value indicating the health of the API - `true` means healthy.
 */
  @Tags("Health")
  @SuccessResponse("200", "OK")
  @Get()
  public get(@Request() request: ContextualRequest): boolean {
    return true;
  }
};
