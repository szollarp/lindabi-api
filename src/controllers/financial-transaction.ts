import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Post, Body } from "tsoa";
import { ContextualRequest } from "../types";
import { FinancialTransaction } from "../models/interfaces/financial-transaction";

@Route("financial-transactions")
export class FinancialTransactionController extends Controller {
  /**
   * Retrieves a list of financial transaction.
   * Secured with JWT token and requires "PettyCash:List" permission.
   *
   * @returns An array of financial transaction objects.
   */
  @Tags("Financial Transaction")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["PettyCash:List", "Tenant"])
  public async getTransactions(@Request() request: ContextualRequest): Promise<FinancialTransaction[]> {
    const { context, user } = request;
    return await context.services.financialTransaction.getFinancialTransactions(context, user);
  }

  /**
   * Creates a new financial transaction.
   * Secured with JWT token and requires "PettyCash:Create" permission.
   *
   * @param body Properties required to create an financial transaction.
   *
   * @returns The created financial transaction object.
   */
  @Tags("Financial Transaction")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["PettyCash:Create", "Tenant"])
  public async createTransaction(@Request() request: ContextualRequest, @Body() body: any): Promise<Partial<FinancialTransaction> | null> {
    const { context, user } = request;
    return await context.services.financialTransaction.createFinancialTransactions(context, user.tenant, user.id, body);
  }
}