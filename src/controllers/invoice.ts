import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete,
  Query,
  FormField,
  UploadedFiles
} from "tsoa";
import type { ContextualRequest } from "../types";
import { CreateInvoiceProperties, Invoice } from "../models/interfaces/invoice";
import { CompletionCertificate } from "../models/interfaces/completion-certificate";

@Route("invoices")
export class InvoiceController extends Controller {
  @Tags("Invoice")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tenant", "Invoice:List"])
  public async getInvoices(@Request() request: ContextualRequest): Promise<Invoice[]> {
    const { context, user } = request;
    return await context.services.invoice.list(context, user);
  }

  @Tags("Invoice")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Tenant", "Invoice:Create"])
  public async createInvoice(@Request() request: ContextualRequest, @Body() body: CreateInvoiceProperties): Promise<Invoice> {
    const { context, user } = request;
    return await context.services.invoice.create(context, user, body);
  }

  @Tags("Invoice")
  @SuccessResponse("200", "OK")
  @Get("{id}")
  @Security("jwtToken", ["Tenant", "Invoice:Get"])
  public async getInvoice(@Request() request: ContextualRequest, @Path() id: number): Promise<Invoice | null> {
    const { context, user } = request;
    return await context.services.invoice.get(context, user, id);
  }

  @Tags("Invoice")
  @SuccessResponse("200", "OK")
  @Put("{id}")
  @Security("jwtToken", ["Tenant", "Invoice:Update"])
  public async updateInvoice(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Invoice>): Promise<Invoice> {
    const { context, user } = request;
    return await context.services.invoice.update(context, user, id, body);
  }

  @Tags("Invoice")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Tenant", "Invoice:Delete"])
  public async deleteInvoice(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.invoice.remove(context, user, id);
  }

  @Tags("Invoice")
  @SuccessResponse("200", "OK")
  @Get("/possible-completion-certificate/get")
  @Security("jwtToken", ["Tenant", "Invoice:Get"])
  public async getPossibleCompletionCertificate(@Request() request: ContextualRequest, @Query() projectId: number, @Query() employeeId: number): Promise<CompletionCertificate[]> {
    const { context, user } = request;
    return await context.services.invoice.getPossibleCompletionCertificate(context, user, projectId, employeeId);
  }

  @Tags("Invoice")
  @SuccessResponse("200", "OK")
  @Post("{id}/documents")
  @Security("jwtToken", ["Invoice:Update", "Tenant"])
  public async addDocument(
    @Request() request: ContextualRequest,
    @Path() id: number,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.document.upload(context, user, id, "invoice", "invoice", files, {});
  }

  @Tags("Invoice")
  @SuccessResponse("200", "OK")
  @Delete("{ownerId}/document/{id}")
  @Security("jwtToken", ["Invoice:Update", "Tenant"])
  public async removeDocument(@Request() request: ContextualRequest, @Path() id: number): Promise<{ removed: boolean }> {
    const { context } = request;
    return await context.services.document.removeDocument(context, id);
  }

}