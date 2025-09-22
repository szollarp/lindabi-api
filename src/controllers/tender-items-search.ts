import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Query } from "tsoa";
import type { ContextualRequest } from "../types";
import { TenderItemsSearchResult } from "../models/interfaces/tender-items-search";

@Route("tender-items-search")
export class TenderItemsSearchController extends Controller {
  /**
   * Search for tender items using fuzzy search with ranking.
   * Requires a valid JWT token with "Tenant" permission.
   * 
   * @param query Search query (minimum 2 characters)
   * @param limit Maximum number of results to return (default: 20)
   * @param offset Number of results to skip for pagination (default: 0)
   * @returns Array of tender items search results with ranking and similarity scores
   */
  @Tags("Tender Items Search")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant"])
  public async searchTenderItems(
    @Request() request: ContextualRequest,
    @Query() query: string,
    @Query() limit?: number,
    @Query() offset?: number
  ): Promise<TenderItemsSearchResult[]> {
    const { context, user } = request;

    if (!query || query.length < 2) {
      return [];
    }

    return await context.services.tenderItemsSearch.searchItems(context, {
      query,
      limit: limit || 20,
      offset: offset || 0,
      tenantId: user.tenant
    });
  }

  /**
   * Trigger a backfill/reconcile of the tender items search table.
   * This will rebuild the entire search table from the current items data.
   * Requires a valid JWT token with "Tenant" permission.
   * 
   * @returns Object containing the number of processed items and any errors
   */
  @Tags("Tender Items Search")
  @SuccessResponse("200", "OK")
  @Get("/backfill")
  @Security("authentication", ["Tenant"])
  public async backfillSearchTable(@Request() request: ContextualRequest): Promise<{ processed: number; errors: number }> {
    const { context } = request;
    return await context.services.tenderItemsSearch.backfillSearchTable(context);
  }
}
