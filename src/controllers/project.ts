import {
  Controller, Route, Request, SuccessResponse, Get, Tags,
  Security, Body, Put, Path, Post, Delete
} from "tsoa";
import type { ContextualRequest } from "../types";
import { CreateProjectBody, Project } from "../models/interfaces/project";
import { CreateMilestoneProperties, Milestone } from "../models/interfaces/milestone";

@Route("projects")
export class ProjectController extends Controller {

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/copy-from-tender")
  @Security("jwtToken", ["Tenant", "Project:Create"])
  public async createProject(@Request() request: ContextualRequest, @Body() body: CreateProjectBody): Promise<{ id: number }> {
    const { context, user } = request;
    return await context.services.project.copyFromTender(context, body, user);
  }

  /**
   * Retrieves a list of all projects within the system. This endpoint requires
   * authentication and is protected by JWT tokens with the "Project:List" permission.
   *
   * @returns An array of project objects with partial details to protect sensitive information.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Project:List"])
  public async getProjects(@Request() request: ContextualRequest): Promise<Partial<Project>[]> {
    const { context, user } = request;
    console.log({ user })
    return await context.services.project.getProjects(context, user);
  }

  /**
   * Retrieves detailed information about a specific project by their ID.
   * This endpoint is protected by JWT authentication, requiring "Project:Get" permission.
   *
   * @param id The unique identifier of the project to retrieve.
   * @returns A project object containing partial information, or null if no project is found. 
   * Sensitive information is omitted.
   */
  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async getProject(@Request() request: ContextualRequest, @Path() id: number): Promise<Partial<Project> | null> {
    const { context, user } = request;
    return await context.services.project.getProject(context, user.tenant, id);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/contacts/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateProjectContact(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number, @Body() body: { canShow: boolean, userContact: boolean }): Promise<void> {
    const { context, user } = request;
    return await context.services.project.updateProjectContact(context, user, id, cid, body);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/contacts")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addProjectContact(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { contactId: number }): Promise<void> {
    const { context, user } = request;
    return await context.services.project.addProjectContact(context, user, id, body.contactId);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/contacts/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeProjectContact(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number): Promise<void> {
    const { context, user } = request;
    return await context.services.project.removeProjectContact(context, user, id, cid);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/supervisors")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addProjectSupervisor(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { contactId: number }): Promise<void> {
    const { context, user } = request;
    return await context.services.project.addProjectSupervisor(context, user, id, body.contactId);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/supervisors/{cid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeProjectSupervisor(@Request() request: ContextualRequest, @Path() id: number, @Path() cid: number): Promise<void> {
    const { context, user } = request;
    return await context.services.project.removeProjectSupervisor(context, user, id, cid);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Get("/attributes/get-colors")
  @Security("jwtToken", ["Tenant"])
  public async getColors(@Request() request: ContextualRequest): Promise<string[]> {
    const { context, user } = request;
    return await context.services.project.getProjectColors(context, user.tenant);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Post("/{id}/milestones")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async addMilestone(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateMilestoneProperties): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.addMilestone(context, user, id, body);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Put("/{id}/milestones/{mid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async updateMilestone(@Request() request: ContextualRequest, @Path() id: number, @Path() mid: number, @Body() body: Partial<Milestone>): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.updateMilestone(context, user, id, mid, body);
  }

  @Tags("Project")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/milestones/{mid}")
  @Security("jwtToken", ["Tenant", "Project:Update"])
  public async removeMilestone(@Request() request: ContextualRequest, @Path() id: number, @Path() mid: number): Promise<{ updated: boolean }> {
    const { context, user } = request;
    return await context.services.project.removeMilestone(context, user, id, mid);
  }
}