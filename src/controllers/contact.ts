import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete
} from "tsoa";
import type { CreateContactProperties, Contact } from "../models/interfaces/contact";
import type { CreateProfilePictureProperties } from "../models/interfaces/profile-picture";
import type { ContextualRequest } from "../types";

@Route("contacts")
export class ContactController extends Controller {
  /**
   * Retrieves a list of contacts for the authenticated user's tenant. 
   * This endpoint requires a valid JWT token with "Contact:List" permission.
   *
   * @returns An array of contact objects, each containing partial information about a contact. 
   * Sensitive details are omitted for privacy.
   */
  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Contact:List"])
  public async getContacts(@Request() request: ContextualRequest): Promise<Array<Partial<Contact>>> {
    const { context, user } = request;
    return await context.services.contact.getContacts(context, user.tenant);
  }

  /**
   * Retrieves detailed information about a specific contact by their ID.
   * This endpoint is protected by JWT authentication, requiring "Contact:Get" permission.
   *
   * @param id The unique identifier of the contact to retrieve.
   * @returns A contact object containing partial information, or null if no contact is found. 
   * Sensitive information is omitted.
   */
  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Contact:Get"])
  public async getContact(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Contact> | null> {
    const { context, user } = request;
    return await context.services.contact.getContact(context, user.tenant, id);
  }

  /**
   * Creates a new contact with the provided details. This operation requires
   * a valid JWT token with "Contact:Create" permission. The new contact is associated
   * with the authenticated user's tenant.
   *
   * @param body The properties for creating a new contact.
   * @returns The newly created contact object, containing partial information, 
   * or null if the creation fails. Sensitive data is omitted.
   */
  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Contact:Create"])
  public async createContact(@Request() request: ContextualRequest, @Body() body: CreateContactProperties): Promise<Partial<Contact> | null> {
    const { context, user } = request;
    return await context.services.contact.createContact(context, user.tenant, user.id, body);
  }

  /**
   * Updates an existing contact identified by their ID. This endpoint checks for valid JWT authentication 
   * and requires "Contact:Update" permission. Only the provided fields in the request body are updated.
   *
   * @param id The unique identifier of the contact to update.
   * @param body A partial contact object containing fields to update.
   * @returns The updated contact object, or null if the update was not successful. Sensitive information is omitted.
   */
  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("jwtToken", ["Contact:Update"])
  public async updateContact(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Contact>): Promise<Partial<Contact> | null> {
    const { context, user } = request;
    return await context.services.contact.updateContact(context, user.tenant, id, user.id, body);
  }

  /**
   * Updates or uploads a logo for a specific contact. This operation is protected and requires
   * "Contact:Update" permission. The logo is linked to the contact based on their ID.
   *
   * @param id The ID of the contact to update the logo for.
   * @param body Contains the logo file and associated metadata.
   * @returns An object indicating whether the logo upload was successful.
   */
  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Put("{id}/logo")
  @Security("jwtToken", ["Contact:Update"])
  public async updateLogo(@Request() request: ContextualRequest, @Body() body: CreateProfilePictureProperties, @Path() id: number): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.profilePicture.upload(context, id, user.tenant, body, "Contact");
  }

  /**
   * Deletes multiple contacts based on the provided array of IDs. This operation requires
   * authentication and "Contact:Delete" permission. The deletion affects only the contacts
   * associated with the authenticated user's tenant.
   *
   * @param body An object containing an array of contact IDs to delete.
   * @returns An object indicating the success of the deletion operation.
   */
  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["Contact:Delete"])
  public async deleteContacts(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.contact.deleteContacts(context, user.tenant, body);
  }

  /**
   * Deletes a single contact identified by their ID. This endpoint is secured with JWT authentication
   * and requires "Contact:Delete" permission. The operation is restricted to contacts within the
   * authenticated user's tenant.
   *
   * @param id The ID of the contact to delete.
   * @returns An object indicating whether the deletion was successful.
   */
  @Tags("Contact")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Contact:Delete"])
  public async deleteContact(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.contact.deleteContact(context, user.tenant, id);
  }
};
