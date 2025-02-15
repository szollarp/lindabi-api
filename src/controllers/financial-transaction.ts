import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Post, Body } from "tsoa";
import { ContextualRequest } from "../types";
import { CreateFinancialTransactionProperties, FinancialTransaction } from "../models/interfaces/financial-transaction";

@Route("financial-transactions")
export class FinancialTransactionController extends Controller {
  /**
   * Retrieves a list of financial transaction.
   * Secured with JWT token and requires "FinancialTransaction:List" permission.
   *
   * @returns An array of financial transaction objects.
   */
  @Tags("Financial Transaction")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tenant", "FinancialTransaction:List"])
  public async getTransactions(@Request() request: ContextualRequest): Promise<FinancialTransaction[]> {
    const { context, user } = request;
    return await context.services.financialTransaction.getFinancialTransactions(context, user);
  }

  /**
   * Creates a new financial transaction.
   * Secured with JWT token and requires "FinancialTransaction:Create" permission.
   *
   * @param body Properties required to create an financial transaction.
   *
   * @returns The created financial transaction object.
   */
  @Tags("Financial Transaction")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Tenant", "FinancialTransaction:Create"])
  public async createTransaction(@Request() request: ContextualRequest, @Body() body: any): Promise<Partial<FinancialTransaction> | null> {
    const { context, user } = request;
    return await context.services.financialTransaction.createFinancialTransactions(context, user.tenant, user.id, body);
  }
}