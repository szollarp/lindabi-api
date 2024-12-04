import { Controller, Route, Request, SuccessResponse, Tags, Security, Get, Post, Body, Delete, Path } from "tsoa";
import type { ContextualRequest } from "../types";
import { CreateFinancialSettingProperties, FinancialSetting } from "../models/interfaces/financial-setting";

@Route("settings")
export class SettingsController extends Controller {
  @Tags("Settings")
  @SuccessResponse("200", "OK")
  @Get("/financial")
  @Security("jwtToken", [])
  public async getSettings(@Request() request: ContextualRequest): Promise<FinancialSetting[]> {
    const { context, user } = request;
    return await context.services.financialSettings.list(context, user);
  }

  @Tags("Settings")
  @SuccessResponse("200", "OK")
  @Post("/financial")
  @Security("jwtToken", [])
  public async addSettings(@Request() request: ContextualRequest, @Body() body: { type: string, items: CreateFinancialSettingProperties[] }): Promise<FinancialSetting[]> {
    const { context, user } = request;
    return await context.services.financialSettings.add(context, user, body);
  }

  @Tags("Settings")
  @SuccessResponse("200", "OK")
  @Delete("/financial/{id}")
  @Security("jwtToken", [])
  public async removeSettings(@Request() request: ContextualRequest, @Path() id: number): Promise<void> {
    const { context, user } = request;
    await context.services.financialSettings.remove(context, user, id);
  }
}