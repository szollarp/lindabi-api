import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete, Query
} from "tsoa";
import type { CreateCompanyProperties, Company } from "../models/interfaces/company";
import type { ContextualRequest } from "../types";
import type { COMPANY_TYPE } from "../constants";
import type { CreateDocumentProperties } from "../models/interfaces/document";
import type { Contact } from "../models/interfaces/contact";
import { Location } from "../models/interfaces/location";

@Route("companies")
export class CompanyController extends Controller {
  /**
   * Retrieves a list of companies filtered by type. This endpoint is secured with JWT authentication and requires
   * specific permissions. It supports filtering companies by their type, either CONTRACTOR or CUSTOMER.
   *
   * Authorization tokens and user permissions are validated before processing the request. The user's tenant information
   * is utilized to fetch relevant company data.
   *
   * @param type The type of companies to filter by. Accepts either 'CONTRACTOR' or 'CUSTOMER'.
   * @returns A list of companies that match the filter criteria, with sensitive information omitted.
   */
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Tenant", "Company:List"])
  public async getCompanies(@Request() request: ContextualRequest, @Query() type: COMPANY_TYPE.CONTRACTOR | COMPANY_TYPE.CUSTOMER | COMPANY_TYPE.SUPPLIER): Promise<Array<Partial<Company>>> {
    const { context, user } = request;
    return await context.services.company.getCompanies(context, user.tenant, type);
  }

  /**
   * Fetches detailed information about a specific company identified by its ID. This method ensures that only
   * authenticated users with appropriate permissions can access company details. The endpoint uses JWT for security.
   *
   * @param id The unique identifier of the company to retrieve.
   * @returns The company details if found, otherwise null. Sensitive information is omitted.
   */
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Tenant", "Company:Get"])
  public async getCompany(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Company> | null> {
    const { context, user } = request;
    return await context.services.company.getCompany(context, user.tenant, id);
  }

  /**
   * Creates a new company with the provided details. This endpoint requires authentication and specific permissions.
   * It utilizes the user's tenant and ID from the JWT token for creating the company in the correct context.
   *
   * @param body The properties required to create a new company.
   * @returns The created company's details, with sensitive information omitted, or null if creation failed.
   */
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Tenant", "Company:Create"])
  public async createCompany(@Request() request: ContextualRequest, @Body() body: CreateCompanyProperties): Promise<Partial<Company> | null> {
    const { context, user } = request;
    return await context.services.company.createCompany(context, user.tenant, user.id, body);
  }

  /**
   * Updates an existing company's details identified by its ID. This endpoint checks for valid authentication
   * and the necessary permissions before allowing updates to proceed. The user's tenant and ID are used for
   * authorization and ensuring data consistency.
   *
   * @param id The ID of the company to update.
   * @param body The new details for the company. Partial updates are supported.
   * @returns The updated company details, or null if the update was not successful.
   */
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Put("/{id}")
  @Security("jwtToken", ["Tenant", "Company:Update"])
  public async updateCompany(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Company>): Promise<Partial<Company> | null> {
    const { context, user } = request;
    return await context.services.company.updateCompany(context, user.tenant, id, user.id, body);
  }

  /**
   * Uploads or updates a company's logo. This action is protected and requires authentication and specific permissions.
   * The logo is linked to the company's profile based on the company ID.
   *
   * @param body Contains the image data and metadata for the logo.
   * @param id The company ID to associate the logo with.
   * @returns An object indicating the success of the upload operation.
   */
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Post("{id}/document")
  @Security("jwtToken", ["Tenant", "Company:Update"])
  public async updateDocument(@Request() request: ContextualRequest, @Body() body: CreateDocumentProperties, @Path() id: number): Promise<{ uploaded: boolean }> {
    const { context, user } = request;
    return await context.services.document.upload(context, id, body, "company", false);
  }

  /**
   * Deletes multiple companies based on their IDs. This is a secured endpoint that validates the user's authentication
   * and permissions. The operation uses the user's tenant information for authorization.
   *
   * @param body Contains the list of company IDs to delete.
   * @returns An object indicating whether the deletion was successful.
   */
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Delete("/")
  @Security("jwtToken", ["Tenant", "Company:Delete"])
  public async deleteCompanies(@Request() request: ContextualRequest, @Body() body: { ids: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.company.deleteCompanies(context, user.tenant, body);
  }

  /**
   * Deletes a single company identified by its ID. Like other endpoints, this operation requires authentication
   * and appropriate permissions. The user's tenant information is critical for ensuring secure data manipulation.
   *
   * @param id The ID of the company to delete.
   * @returns An object indicating the outcome of the deletion process.
   */
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Delete("{id}")
  @Security("jwtToken", ["Tenant", "Company:Delete"])
  public async deleteCompany(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.company.deleteCompany(context, user.tenant, id);
  }

  /**
   * Adds multiple contacts to a company specified by the company ID. This operation is secured with JWT and requires
   * "Company:Update" permission, ensuring that only authorized users can add contacts to the company.
   *
   * @param id The unique identifier of the company to which contacts will be added.
   * @param body An array of contacts, represented as partial objects, to be added to the company.
   * @returns An object indicating whether the addition of contacts was successful.
   */
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Post("{id}/contacts")
  @Security("jwtToken", ["Tenant", "Company:Update"])
  public async addContacts(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Contact>[]): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.company.addContacts(context, user.tenant, id, body);
  }

  /**
   * Adds multiple locations to a company specified by the company ID. This method is secured with JWT and requires
   * "Company:Update" permission, allowing only authorized users to add locations to the company.
   *
   * @param id The unique identifier of the company to which locations will be added.
   * @param body An array of location objects, represented as partial objects, to be added to the company.
   * @returns An object indicating whether the addition of locations was successful.
   */
  @Tags("Company")
  @SuccessResponse("200", "OK")
  @Post("{id}/locations")
  @Security("jwtToken", ["Tenant", "Company:Update"])
  public async addLocations(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Location>[]): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.company.addLocations(context, user.tenant, id, body);
  }
};
