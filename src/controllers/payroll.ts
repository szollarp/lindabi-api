import {
  Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put, Path, Post,
  Delete,
  Query
} from "tsoa";
import type { ContextualRequest } from "../types";
import { User } from "../models/interfaces/user";

@Route("payrolls")
export class PayrollController extends Controller {
  @Tags("Payroll")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tenant", "Payroll:List"])
  public async getPayrolls(@Request() request: ContextualRequest, @Query() startDate: string, @Query() endDate: string, @Query() approved: boolean): Promise<Partial<User>[]> {
    const { context, user } = request;
    return await context.services.payroll.getPayrolls(context, user, startDate, endDate, approved);
  }
}