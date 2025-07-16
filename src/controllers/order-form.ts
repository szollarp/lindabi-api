import {
  Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Put, Path, Post,
  Delete
} from "tsoa";
import type { ContextualRequest } from "../types";
import { ApproveOrderFormProperties, CreateOrderFormProperties, OrderForm } from "../models/interfaces/order-form";
import { Project } from "../models/interfaces/project";

@Route("order-forms")
export class OrderFormController extends Controller {
  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Tenant", "OrderForm:List"])
  public async getOrderForms(@Request() request: ContextualRequest): Promise<OrderForm[]> {
    const { context, user } = request;
    return await context.services.orderForm.list(context, user);
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Tenant", "OrderForm:Create"])
  public async createOrderForm(@Request() request: ContextualRequest, @Body() body: CreateOrderFormProperties): Promise<OrderForm> {
    const { context, user } = request;
    const orderForm = await context.services.orderForm.create(context, user, body);

    if (!!orderForm) {
      await context.services.notification.sendOrderFormCreateNotification(context, orderForm);
    }

    return orderForm;
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Get("{id}")
  @Security("authentication", ["Tenant", "OrderForm:Get"])
  public async getOrderForm(@Request() request: ContextualRequest, @Path() id: number): Promise<OrderForm | null> {
    const { context, user } = request;
    return await context.services.orderForm.get(context, user, id);
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Put("{id}")
  @Security("authentication", ["Tenant", "OrderForm:Update"])
  public async updateOrderForm(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<OrderForm>): Promise<OrderForm> {
    const { context, user } = request;
    return await context.services.orderForm.update(context, user, id, body);
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Put("{id}/resend-code")
  @Security("authentication", ["Tenant", "OrderForm:Approve"])
  public async resendApproveCode(@Request() request: ContextualRequest, @Path() id: number): Promise<OrderForm> {
    const { context, user } = request;
    return await context.services.orderForm.resendCode(context, user, id);
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Put("{id}/approve")
  @Security("authentication", ["Tenant", "OrderForm:Approve"])
  public async approveOrderForm(@Request() request: ContextualRequest, @Path() id: number, @Body() body: ApproveOrderFormProperties): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.orderForm.approve(context, user, id, body);
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Get("/projects/related")
  @Security("authentication", ["Tenant", "OrderForm:List"])
  public async getRelatedProjects(@Request() request: ContextualRequest): Promise<Array<Partial<Project>>> {
    const { context, user } = request;
    return await context.services.orderForm.getProjects(context, user);
  }

  @Tags("Order Form")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("authentication", ["Tenant", "OrderForm:Delete"])
  public async deleteOrderForm(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.orderForm.remove(context, user, id);
  }
}
