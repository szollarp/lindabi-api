import { Controller, Get, Route, Request, SuccessResponse, Tags } from "tsoa";
import type { ContextualRequest } from "../types";

@Route("version")
export class VersionController extends Controller {
  /**
 * Retrieves the current version of the application or service.
 * This endpoint is typically used for health checks or monitoring the version of the deployed application.
 * @returns The current version as a string. If the version is not set, it returns "non-versioned".
 */
  @Tags("Version")
  @SuccessResponse("200", "OK")
  @Get()
  public get(@Request() request: ContextualRequest): string {
    const version = request.context.services.version.get();
    return version ?? "non-versioned";
  }
};
