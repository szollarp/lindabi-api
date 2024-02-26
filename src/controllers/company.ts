import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete, Query
} from "tsoa";
import type { CreateCompanyProperties, Company } from "../models/interfaces/company";
import type { CreateProfilePictureProperties } from "../models/interfaces/profile-picture";
import type { ContextualRequest } from "../types";
import type { COMPANY_TYPE } from "../constants";

@Route("companies")
export class CompanyController extends Controller {
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Company:List"])
  public async getCompanies(@Request() request: ContextualRequest, @Query() type: COMPANY_TYPE.CONTRACTOR | COMPANY_TYPE.CUSTOMER): Promise<Array<Partial<Company>>> {
    const { context, user } = request;
    return await context.services.company.getCompanies(context, user.tenant, type);
  }

  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Company:Get"])
  public async getCompany(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Company> | null> {
    const { context, user } = request;
    return await context.services.company.getCompany(context, user.tenant, id);
  }

  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Company:Create"])
  public async createCompany(@Request() request: ContextualRequest, @Body() body: CreateCompanyProperties): Promise<Partial<Company> | null> {
    const { context, user } = request;
    return await context.services.company.createCompany(context, user.tenant, user.id, body);
  }

  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("jwtToken", ["Company:Update"])
  public async updateCompany(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Company>): Promise<Partial<Company> | null> {
    const { context, user } = request;
    return await context.services.company.updateCompany(context, user.tenant, id, user.id, body);
  }

  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Put("{id}/logo")
  @Security("jwtToken", ["Company:Update"])
  public async updateLogo(@Request() request: ContextualRequest, @Body() body: CreateProfilePictureProperties, @Path() id: number): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.profilePicture.upload(context, id, user.tenant, body, "company");
  }

  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["Company:Delete"])
  public async deleteCompanies(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.company.deleteCompanies(context, user.tenant, body);
  }

  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Company:Delete"])
  public async deleteCompany(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.company.deleteCompany(context, user.tenant, id);
  }
};
