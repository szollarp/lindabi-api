import { Controller, Get, Route, Request, SuccessResponse, Tags, Security } from "tsoa";
import type { ContextualRequest } from "../types";
import type {
  BasketValuesAnalytics,
  QuoteSuccessRateAnalytics,
  JobProfitabilityAnalytics,
  QuoteDateAnalytics,
  AllAnalytics,
  TenderCountSummary
} from "../services/statistics";

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
  @Security("authentication", ["Tenant:List"])
  public get(@Request() request: ContextualRequest): Promise<{ userNum: number, tenderNum: number, invoiceNum: number }> {
    const { context } = request;
    return context.services.statistics.getOverview(context);
  }

  /**
   * Retrieves all analytics data in a single request.
   * @returns Combined analytics data including basket values, success rate, profitability, and date analytics
   */
  @Tags("Statistics")
  @SuccessResponse("200", "OK")
  @Get("all")
  @Security("authentication", ["Tenant:List"])
  public async getAllAnalytics(@Request() request: ContextualRequest): Promise<AllAnalytics> {
    const { context, user } = request;
    return context.services.statistics.getAllAnalytics(context, user.tenant);
  }

  /**
   * Retrieves tender counts grouped by status.
   * @returns Summary of tender counts by status
   */
  @Tags("Statistics")
  @SuccessResponse("200", "OK")
  @Get("tender-counts")
  @Security("authentication", ["Tenant:List"])
  public async getTenderCounts(@Request() request: ContextualRequest): Promise<TenderCountSummary> {
    const { context, user } = request;
    return context.services.statistics.getTenderCounts(context, user.tenant);
  }

  /**
   * Retrieves basket values analytics showing average values of ordered quotes and jobs.
   * @returns Analytics data for basket values
   */
  @Tags("Statistics")
  @SuccessResponse("200", "OK")
  @Get("basket-values")
  @Security("authentication", ["Tenant:List"])
  public getBasketValues(@Request() request: ContextualRequest): Promise<BasketValuesAnalytics> {
    const { context, user } = request;
    return context.services.statistics.getBasketValues(context, user.tenant);
  }

  /**
   * Retrieves quote success rate analytics showing how many quotes were sent vs accepted.
   * @returns Analytics data for quote success rates
   */
  @Tags("Statistics")
  @SuccessResponse("200", "OK")
  @Get("quote-success-rate")
  @Security("authentication", ["Tenant:List"])
  public getQuoteSuccessRate(@Request() request: ContextualRequest): Promise<QuoteSuccessRateAnalytics> {
    const { context, user } = request;
    return context.services.statistics.getQuoteSuccessRate(context, user.tenant);
  }

  /**
   * Retrieves job profitability analytics showing revenue vs costs for completed jobs.
   * @returns Analytics data for job profitability
   */
  @Tags("Statistics")
  @SuccessResponse("200", "OK")
  @Get("job-profitability")
  @Security("authentication", ["Tenant:List"])
  public getJobProfitability(@Request() request: ContextualRequest): Promise<JobProfitabilityAnalytics> {
    const { context, user } = request;
    return context.services.statistics.getJobProfitability(context, user.tenant);
  }

  /**
   * Retrieves quote date-based statistics showing trends over time.
   * @returns Analytics data for quote statistics by date
   */
  @Tags("Statistics")
  @SuccessResponse("200", "OK")
  @Get("quote-date-analytics")
  @Security("authentication", ["Tenant:List"])
  public getQuoteDateAnalytics(@Request() request: ContextualRequest): Promise<QuoteDateAnalytics> {
    const { context, user } = request;
    return context.services.statistics.getQuoteDateAnalytics(context, user.tenant);
  }

  /**
   * Manually triggers analytics update for the current tenant or all tenants.
   * @returns Success message
   */
  @Tags("Statistics")
  @SuccessResponse("200", "OK")
  @Get("trigger-update")
  @Security("authentication", ["Tenant:List"])
  public async triggerAnalyticsUpdate(@Request() request: ContextualRequest): Promise<{ message: string }> {
    const { context, user } = request;
    await context.services.statistics.triggerAnalyticsUpdate(context, user.tenant, user.id);
    return { message: "Analytics update triggered successfully" };
  }
};
