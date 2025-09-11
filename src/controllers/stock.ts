import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Path, Query } from "tsoa";
import type { ContextualRequest } from "../types";
import { StockReport, StockItem, StockFilters } from "../models/interfaces/stock";

@Route("stock")
export class StockController extends Controller {
  /**
   * Retrieves a comprehensive stock report for a specific warehouse or project.
   * Requires a valid JWT token with "InventoryTransaction:List" permission.
   *
   * @param entityType The type of entity (warehouse or project)
   * @param entityId The ID of the warehouse or project
   * @returns A complete stock report with items and transactions
   */
  @Tags("Stock")
  @SuccessResponse("200", "OK")
  @Get("/report/{entityType}/{entityId}")
  @Security("authentication", ["Tenant", "InventoryTransaction:List"])
  public async getStockReport(
    @Request() request: ContextualRequest,
    @Path() entityType: "warehouse" | "project",
    @Path() entityId: number
  ): Promise<StockReport> {
    const { context, user } = request;
    return await context.services.stock.getStockReport(context, user.tenant, entityType, entityId);
  }

  /**
   * Retrieves stock items for a specific warehouse or project with optional filtering.
   * Requires a valid JWT token with "InventoryTransaction:List" permission.
   *
   * @param entityType The type of entity (warehouse or project)
   * @param entityId The ID of the warehouse or project
   * @param keyword Optional search keyword for filtering items
   * @param showZeroStock Whether to include items with zero stock
   * @param sortBy Field to sort by (itemName, currentStock, lastTransaction)
   * @param sortOrder Sort order (asc or desc)
   * @returns An array of stock items with their current levels and transaction history
   */
  @Tags("Stock")
  @SuccessResponse("200", "OK")
  @Get("/items/{entityType}/{entityId}")
  @Security("authentication", ["Tenant", "InventoryTransaction:List"])
  public async getStockItems(
    @Request() request: ContextualRequest,
    @Path() entityType: "warehouse" | "project",
    @Path() entityId: number,
    @Query() keyword?: string,
    @Query() showZeroStock?: boolean,
    @Query() sortBy?: "itemName" | "currentStock" | "lastTransaction",
    @Query() sortOrder?: "asc" | "desc"
  ): Promise<StockItem[]> {
    const { context, user } = request;
    const filters: StockFilters = {
      keyword: keyword || "",
      showZeroStock: showZeroStock || false,
      sortBy: sortBy || "itemName",
      sortOrder: sortOrder || "asc"
    };
    return await context.services.stock.getStockItems(context, user.tenant, entityType, entityId, filters);
  }

  /**
   * Retrieves inventory transactions for a specific warehouse or project.
   * Requires a valid JWT token with "InventoryTransaction:List" permission.
   *
   * @param entityType The type of entity (warehouse or project)
   * @param entityId The ID of the warehouse or project
   * @param keyword Optional search keyword for filtering transactions
   * @returns An array of inventory transactions related to the entity
   */
  @Tags("Stock")
  @SuccessResponse("200", "OK")
  @Get("/transactions/{entityType}/{entityId}")
  @Security("authentication", ["Tenant", "InventoryTransaction:List"])
  public async getStockTransactions(
    @Request() request: ContextualRequest,
    @Path() entityType: "warehouse" | "project",
    @Path() entityId: number,
    @Query() keyword?: string
  ): Promise<any[]> {
    const { context, user } = request;
    const filters: Partial<StockFilters> = {
      keyword: keyword || ""
    };
    return await context.services.stock.getStockTransactions(context, user.tenant, entityType, entityId, filters);
  }
}
