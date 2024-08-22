import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Post, Path, Body, Put, Delete } from "tsoa";
import type { CreateUserProperties, User, UserBilling } from "../models/interfaces/user";
import type { ContextualRequest } from "../types";
import { CreateDocumentProperties, Document } from "../models/interfaces/document";

@Route("employees")
export class EmployeeController extends Controller {
  /**
   * Retrieves a list of employees.
   * Secured with JWT token and requires "Employee:List" permission.
   *
   * @returns An array of employee objects.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Employee:List", "Tenant"])
  public async getEmployees(@Request() request: ContextualRequest): Promise<Array<Partial<User>>> {
    const { context, user } = request;
    return await context.services.user.list(context, user.tenant, "employee");
  }

  /**
 * Creates a new employee.
 * Secured with JWT token and requires "Employee:Create" permission.
 *
 * @param body Properties required to create an employee.
 *
 * @returns The created employee object.
 */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Employee:Create", "Tenant"])
  public async createEmployee(@Request() request: ContextualRequest, @Body() body: CreateUserProperties): Promise<Partial<User>> {
    const { context, user } = request;
    const newUser = await context.services.user.create(context, user.tenant, body, user.id);
    if (newUser) {
      await context.services.notification.sendUserCreatedNotification(context, newUser);
    }

    return newUser;
  }

  /**
   * Deletes multiple employees by their IDs.
   * Secured with JWT token and requires "Employee:Delete" permission.
   *
   * @param body An object containing an array of employee IDs to delete.
   *
   * @returns A response indicating whether the deletion of employees was successful.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["Employee:Delete", "Tenant"])
  public async deleteEmployees(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.user.deleteUsers(context, user.tenant, body);
  }

  /**
   * Updates an existing employee.
   * Secured with JWT token and requires "Employee:Update" permission.
   *
   * @param body Properties to update in the employee.
   * @param id The ID of the employee to update.
   *
   * @returns The updated employee object.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Put("{id}")
  @Security("jwtToken", ["Employee:Update", "Tenant"])
  public async updateEmployee(@Request() request: ContextualRequest, @Body() body: Partial<User>, @Path() id: number): Promise<Partial<User>> {
    const { context, user } = request;
    const tenant = user.id === id ? null : user.tenant;
    const updatedUser = await context.services.user.update(context, tenant, id, body, user.id);
    if (updatedUser) {
      await context.services.notification.sendUserUpdateNotification(context, updatedUser);
    }

    return updatedUser;
  }

  /**
   * Retrieves a single employee by ID.
   * Secured with JWT token and requires "Employee:Get" permission.
   *
   * @param id The ID of the employee to retrieve.
   *
   * @returns The requested employee object.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Get("{id}")
  @Security("jwtToken", ["Employee:Get", "Tenant"])
  public async getEmployee(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<User>> {
    const { context, user } = request;
    const tenant = user.id === id ? null : user.tenant;
    return await context.services.user.get(context, tenant, id);
  }


  /**
   * Deletes a employee by ID.
   * Secured with JWT token and requires "Employee:Delete" permission.
   *
   * @param id The ID of the employee to delete.
   *
   * @returns A response indicating whether the deletion was successful.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Employee:Delete", "Tenant"])
  public async deleteEmployee(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.user.deleteUser(context, user.tenant, id);
  }

  /**
   * Adds a document to an employee's record specified by the employee ID. This operation is secured with JWT and requires
   * "Employee:Update" permission, ensuring that only authorized users can add documents.
   *
   * @param id The unique identifier of the employee to whom the document will be added.
   * @param body The properties of the document to be created.
   * @returns An object indicating whether the document upload was successful.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Post("{id}/documents")
  @Security("jwtToken", ["Employee:Update", "Tenant"])
  public async addDocument(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateDocumentProperties): Promise<{ uploaded: boolean }> {
    const { context } = request;
    return await context.services.document.upload(context, id, body, "user", true);
  }

  /**
   * Removes a document from an employee's record. This method requires "Employee:Update" permission and is secured with JWT,
   * allowing only authorized users to delete documents.
   *
   * @param ownerId The ID of the employee from whom the document will be removed.
   * @param id The unique identifier of the document to be removed.
   * @returns An object indicating whether the document was successfully removed.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Delete("{ownerId}/document/{id}")
  @Security("jwtToken", ["Employee:Update", "Tenant"])
  public async removeDocument(@Request() request: ContextualRequest, @Path() ownerId: number, @Path() id: number): Promise<{ removed: boolean }> {
    const { context } = request;
    return await context.services.document.remove(context, ownerId, id, "user");
  }

  /**
   * Updates a specific document for an employee identified by the document ID. This operation is secured with JWT and requires
   * "Employee:Update" permission, ensuring that only authorized personnel can make changes to documents.
   *
   * @param ownerId The ID of the employee whose document is being updated.
   * @param id The unique identifier of the document to update.
   * @param body The partial updates to be applied to the document.
   * @returns The updated document object.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Put("{ownerId}/document/{id}")
  @Security("jwtToken", ["Employee:Update", "Tenant"])
  public async updateDocument(@Request() request: ContextualRequest, @Path() ownerId: number, @Path() id: number, @Body() body: Partial<Document>): Promise<Document> {
    const { context } = request;
    return await context.services.document.update(context, ownerId, id, "user", body);
  }

  /**
   * Checks the status of documents associated with a specific employee. This method is secured with JWT and requires
   * "Employee:Get" permission, allowing for verification of document status by authorized users.
   *
   * @param id The ID of the employee whose documents are being checked.
   * @returns A summary or detailed status of the employee's documents.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Get("{id}/check-documents")
  @Security("jwtToken", ["Employee:Get", "Tenant"])
  public async checkDocuments(@Request() request: ContextualRequest, @Path() id: number): Promise<any> {
    const { context, user } = request;
    return await context.services.document.checkUserDocuments(context, user.tenant, id);
  }


  /**
   * Updates the billing information for an employee by ID. This operation is secured with JWT and requires
   * "Employee:Update" permission, ensuring that only authorized users can update billing details.
   *
   * @param id The ID of the employee whose billing information is being updated.
   * @param body The billing information to update.
   * @returns A partial user object reflecting the updated billing information.
   */
  @Tags("Employee")
  @SuccessResponse("200", "OK")
  @Put("{id}/billing")
  @Security("jwtToken", ["Employee:Update", "Tenant"])
  public async updateBilling(@Request() request: ContextualRequest, @Path() id: number, @Body() body: UserBilling): Promise<Partial<User>> {
    const { context, user } = request;
    return await context.services.user.update(context, user.tenant, id, { billing: body }, user.id);
  }
};
