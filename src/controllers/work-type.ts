import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Path, Post, Put, Body, Delete } from "tsoa";
import type { ContextualRequest } from "../types";
import { CreateWorkTypeProperties, WorkType } from "../models/interfaces/work-type";

@Route("work-types")
export class WorkTypeController extends Controller {
  @Tags("Work Type")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant", "WorkType:List"])
  public async getWorkTypes(@Request() request: ContextualRequest): Promise<WorkType[]> {
    const { context, user } = request;
    return await context.services.workType.get(context, user);
  }

  @Tags("Work Type")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant", "WorkType:Create"])
  public async createWorkType(@Request() request: ContextualRequest, @Body() data: CreateWorkTypeProperties): Promise<WorkType> {
    const { context, user } = request;
    return await context.services.workType.create(context, user, data);
  }

  @Tags("Work Type")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("authentication", ["Tenant", "WorkType:Update"])
  public async updateWorkType(@Request() request: ContextualRequest, @Path() id: number, @Body() data: CreateWorkTypeProperties): Promise<WorkType | null> {
    const { context, user } = request;
    return await context.services.workType.update(context, user, id, data);
  }

  @Tags("Work Type")
  @SuccessResponse("200", "OK")
  @Delete("/{id}")
  @Security("authentication", ["Tenant", "WorkType:Delete"])
  public async deleteWorkType(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.workType.delete(context, user, id);
  }
}