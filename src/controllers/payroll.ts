import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Path, Query } from "tsoa";
import type { ContextualRequest } from "../types";
import { User } from "../models/interfaces/user";

@Route("payrolls")
export class PayrollController extends Controller {
  @Tags("Payroll")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant", "Payroll:List"])
  public async getPayrolls(@Request() request: ContextualRequest, @Query() startDate: string, @Query() endDate: string, @Query() approved: boolean): Promise<Partial<User>[]> {
    const { context, user } = request;
    console.log("Fetching payrolls with params:", { startDate, endDate, user, approved });
    return await context.services.payroll.getPayrolls(context, user, startDate, endDate, approved);
  }

  @Tags("Payroll")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("authentication", ["Tenant", "Payroll:List"])
  public async getPayroll(@Request() request: ContextualRequest, @Query() startDate: string, @Query() endDate: string, @Query() approved: boolean, @Path() id: number): Promise<Partial<User>> {
    const { context, user } = request;
    return await context.services.payroll.getPayrollByEmployee(context, user, startDate, endDate, approved, id);
  }
}