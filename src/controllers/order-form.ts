import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete,
  Query,
  UploadedFiles,
  FormField
} from "tsoa";
import type { ContextualRequest } from "../types";
import { CreateOrderFormProperties, OrderForm } from "../models/interfaces/order-form";
import { Project } from "../models/interfaces/project";

@Route("order-forms")
export class OrderFormController extends Controller {
  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tenant", "OrderForm:List"])
  public async getOrderForms(@Request() request: ContextualRequest): Promise<OrderForm[]> {
    const { context, user } = request;
    return await context.services.orderForm.list(context, user);
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Tenant", "OrderForm:Create"])
  public async createOrderForm(@Request() request: ContextualRequest, @Body() body: CreateOrderFormProperties): Promise<OrderForm> {
    const { context, user } = request;
    return await context.services.orderForm.create(context, user, body);
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("jwtToken", ["Tenant", "OrderForm:Update"])
  public async updateOrderForm(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<OrderForm>): Promise<OrderForm> {
    const { context, user } = request;
    return await context.services.orderForm.update(context, user, id, body);
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Get("/related-projects")
  @Security("jwtToken", ["Tenant", "OrderForm:List"])
  public async getRelatedProjects(@Request() request: ContextualRequest): Promise<Array<Partial<Project>>> {
    const { context, user } = request;
    return await context.services.orderForm.getRelatedProjects(context, user);
  }
}
