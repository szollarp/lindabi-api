import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete
} from "tsoa";
import type { CreateContactProperties, Contact } from "../models/interfaces/contact";
import type { CreateProfilePictureProperties } from "../models/interfaces/profile-picture";
import type { ContextualRequest } from "../types";

@Route("contacts")
export class ContactController extends Controller {
  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Contact:List"])
  public async getContacts(@Request() request: ContextualRequest): Promise<Array<Partial<Contact>>> {
    const { context, user } = request;
    return await context.services.contact.getContacts(context, user.tenant);
  }

  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Contact:Get"])
  public async getContact(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Contact> | null> {
    const { context, user } = request;
    return await context.services.contact.getContact(context, user.tenant, id);
  }

  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Contact:Create"])
  public async createContact(@Request() request: ContextualRequest, @Body() body: CreateContactProperties): Promise<Partial<Contact> | null> {
    const { context, user } = request;
    return await context.services.contact.createContact(context, user.tenant, user.id, body);
  }

  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("jwtToken", ["Contact:Update"])
  public async updateContact(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Contact>): Promise<Partial<Contact> | null> {
    const { context, user } = request;
    return await context.services.contact.updateContact(context, user.tenant, id, user.id, body);
  }

  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Put("{id}/logo")
  @Security("jwtToken", ["Contact:Update"])
  public async updateLogo(@Request() request: ContextualRequest, @Body() body: CreateProfilePictureProperties, @Path() id: number): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.profilePicture.upload(context, id, user.tenant, body, "Contact");
  }

  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["Contact:Delete"])
  public async deleteContacts(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.contact.deleteContacts(context, user.tenant, body);
  }

  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Contact:Delete"])
  public async deleteContact(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.contact.deleteContact(context, user.tenant, id);
  }
};
