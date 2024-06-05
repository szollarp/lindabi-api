import { Controller, Get, Route, Request, SuccessResponse, Tags, Security } from "tsoa";
import type { ContextualRequest } from "../types";

@Route("statistics")
export class StatisticsController extends Controller {
  /**
   * Retrieves the statistics of the API. This method is used for monitoring
   * and tracking the usage of the API.
   * @returns A boolean value indicating the statistics of the API - `true` means healthy.
   */
  @Tags("Statistics")
  @SuccessResponse("200", "OK")
  @Get("overview")
  @Security("jwtToken", ["Tenant:List"])
  public get(@Request() request: ContextualRequest): Promise<{ userNum: number, tenderNum: number, invoiceNum: number }> {
    const { context } = request;
    return context.services.statistics.getOverview(context);
  }
};
