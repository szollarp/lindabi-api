import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Post, Path, Body, Put, Delete } from "tsoa";
import type { CreateUserProperties, UpdatePasswordProperties, UpdateUserProperties, User } from "../models/interfaces/user";
import type { ContextualRequest } from "../types";
import { CreateImageProperties } from "../models/interfaces/image";

@Route("users")
export class UserController extends Controller {
  /**
   * Retrieves a list of users.
   * Secured with JWT token and requires "User:List" permission.
   *
   * @returns An array of user objects.
   */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["User:List", "Tenant"])
  public async getUsers(@Request() request: ContextualRequest): Promise<Array<Partial<User>>> {
    const { context, user } = request;
    return await context.services.user.list(context, user.tenant);
  }

  /**
 * Creates a new user.
 * Secured with JWT token and requires "User:Create" permission.
 *
 * @param body Properties required to create a user.
 *
 * @returns The created user object.
 */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["User:Create", "Tenant"])
  public async createUser(@Request() request: ContextualRequest, @Body() body: CreateUserProperties): Promise<Partial<User>> {
    const { context, user } = request;
    return await context.services.user.create(context, user.tenant, body);
  }

  /**
   * Deletes multiple users by their IDs.
   * Secured with JWT token and requires "User:Delete" permission.
   *
   * @param body An object containing an array of user IDs to delete.
   *
   * @returns A response indicating whether the deletion of users was successful.
   */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["User:Delete", "Tenant"])
  public async deleteUsers(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.user.deleteUsers(context, user.tenant, body);
  }

  /**
   * Updates an existing user.
   * Secured with JWT token and requires "User:Update" permission.
   *
   * @param body Properties to update in the user.
   * @param id The ID of the user to update.
   *
   * @returns The updated user object.
   */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Put("{id}")
  @Security("jwtToken", ["User:Update", "Me:*", "Tenant"])
  public async updateUser(@Request() request: ContextualRequest, @Body() body: UpdateUserProperties, @Path() id: number): Promise<Partial<User>> {
    const { context, user } = request;
    const tenant = user.id === id ? null : user.tenant;
    return await context.services.user.update(context, tenant, id, body);
  }

  /**
   * Retrieves a single user by ID.
   * Secured with JWT token and requires "User:Get" permission.
   *
   * @param id The ID of the user to retrieve.
   *
   * @returns The requested user object.
   */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Get("{id}")
  @Security("jwtToken", ["User:Get", "Me:*", "Tenant"])
  public async getUser(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<User>> {
    const { context, user } = request;
    const tenant = user.id === id ? null : user.tenant;
    return await context.services.user.get(context, tenant, id);
  }

  /**
   * Updates the profile picture of a user by ID.
   * Secured with JWT token and requires "User:Update" or "Me:*" permission.
   *
   * @param body The properties to update the profile picture.
   * @param id The ID of the user to update the profile picture.
   *
   * @returns A response indicating whether the update was successful.
   */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Put("{id}/avatar")
  @Security("jwtToken", ["User:Update", "Me:*", "Tenant"])
  public async updateUserProfilePicture(@Request() request: ContextualRequest, @Body() body: CreateImageProperties, @Path() id: number): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.image.upload(context, id, body, "user");
  }

  /**
   * Updates the password of a user by ID.
   * Secured with JWT token and requires "User:Update" or "Me:*" permission.
   *
   * @param body The new password properties.
   * @param id The ID of the user to update the password.
   *
   * @returns A response indicating whether the update was successful.
   */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Put("{id}/new-password")
  @Security("jwtToken", ["User:Update", "Me:*", "Tenant"])
  public async updateUserPassword(@Request() request: ContextualRequest, @Body() body: UpdatePasswordProperties, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.user.updatePassword(context, user.tenant, id, body);
  }

  /**
   * Resends the verification email for a user by ID.
   * Secured with JWT token and requires "User:Update" permission.
   *
   * @param id The ID of the user to resend the verification email.
   *
   * @returns A response indicating whether the email was successfully resent.
   */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Put("{id}/resend-verification-email")
  @Security("jwtToken", ["User:Update", "Tenant"])
  public async resendVerificationEmail(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.user.resendVerificationEmail(context, user.tenant, id);
  }

  /**
 * Sets up two-factor authentication for a user by ID.
 * Secured with JWT token and requires "User:Update" or "Me:*" permission.
 *
 * @param id The ID of the user to set up two-factor authentication.
 *
 * @returns A response indicating whether the setup was successful, and an optional QR code for authentication.
 */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Post("{id}/two-factor-authentication")
  @Security("jwtToken", ["User:Update", "Me:*"])
  public async generateTwoFactorAuthenticationConfig(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean, qrCode: string }> {
    const { context, user } = request;
    const tenant = user.id === id ? null : user.tenant;

    return await context.services.user.generateTwoFactorAuthenticationConfig(context, tenant, id);
  }

  @Tags("User")
  @SuccessResponse("200", "OK")
  @Put("{id}/two-factor-authentication")
  @Security("jwtToken", ["User:Update", "Me:*"])
  public async enableTwoFactorAuthentication(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { code: string }): Promise<{ success: boolean }> {
    const { context, user } = request;
    const tenant = user.id === id ? null : user.tenant;
    return await context.services.user.enableTwoFactorAuthentication(context, tenant, id, body);
  }

  @Tags("User")
  @SuccessResponse("200", "OK")
  @Delete("{id}/two-factor-authentication")
  @Security("jwtToken", ["User:Update", "Me:*"])
  public async disableTwoFactorAuthentication(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    const tenant = user.id === id ? null : user.tenant;
    return await context.services.user.disableTwoFactorAuthentication(context, tenant, id);
  }

  /**
   * Deletes a user by ID.
   * Secured with JWT token and requires "User:Delete" permission.
   *
   * @param id The ID of the user to delete.
   *
   * @returns A response indicating whether the deletion was successful.
   */
  @Tags("User")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["User:Delete", "Me:*", "Tenant"])
  public async delete(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.user.deleteUser(context, user.tenant, id);
  }
};
