import {
  Controller, Route, Request, SuccessResponse, Get,
  Tags, Security, Body, Put, Path, Post, Delete,
  Query
} from "tsoa";
import type { ContextualRequest } from "../types";
import { CompletionCertificate, CreateCompletionCertificateProperties } from "../models/interfaces/completion-certificate";
import { OrderForm } from "../models/interfaces/order-form";

@Route("completion-certificates")
export class CompletionCertificateController extends Controller {
  @Tags("Completion Certificate")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant", "CompletionCertificate:List"])
  public async getCompletionCertificates(@Request() request: ContextualRequest): Promise<CompletionCertificate[]> {
    const { context, user } = request;
    return await context.services.completionCertificate.list(context, user);
  }

  @Tags("Completion Certificate")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant", "CompletionCertificate:Create"])
  public async createCompletionCertificate(@Request() request: ContextualRequest, @Body() body: CreateCompletionCertificateProperties): Promise<CompletionCertificate> {
    const { context, user } = request;
    return await context.services.completionCertificate.create(context, user, body);
  }

  @Tags("Completion Certificate")
  @SuccessResponse("200", "OK")
  @Get("{id}")
  @Security("authentication", ["Tenant", "CompletionCertificate:Get"])
  public async getCompletionCertificate(@Request() request: ContextualRequest, @Path() id: number): Promise<CompletionCertificate | null> {
    const { context } = request;
    return await context.services.completionCertificate.get(context, id);
  }

  @Tags("Completion Certificate")
  @SuccessResponse("200", "OK")
  @Put("{id}")
  @Security("authentication", ["Tenant", "CompletionCertificate:Update"])
  public async updateCompletionCertificate(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<CompletionCertificate>): Promise<CompletionCertificate> {
    const { context, user } = request;
    return await context.services.completionCertificate.update(context, user, id, body);
  }

  @Tags("Completion Certificate")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("authentication", ["Tenant", "CompletionCertificate:Delete"])
  public async deleteCompletionCertificate(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context } = request;
    return await context.services.completionCertificate.remove(context, id);
  }

  @Tags("Completion Certificate")
  @SuccessResponse("200", "OK")
  @Get("/get/order-forms")
  @Security("authentication", ["Tenant", "CompletionCertificate:Get"])
  public async getOrderForms(@Request() request: ContextualRequest, @Query() employeeId: number, @Query() projectId: number): Promise<OrderForm[]> {
    const { context } = request;
    return await context.services.completionCertificate.getOrderForms(context, employeeId, projectId);
  }
}
