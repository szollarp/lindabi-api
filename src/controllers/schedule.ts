import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Query, Post, Body, Put, Delete, Path } from "tsoa";
import type { User } from "../models/interfaces/user";
import type { ContextualRequest } from "../types";
import { USER_TYPE } from "../constants";
import { CreateEmployeeScheduleProperties, CreateHolidayScheduleProperties, EmployeeSchedule } from "../models/interfaces/employee-schedule";

@Route("schedules")
export class ScheduleController extends Controller {
  /**
   * Retrieves a list of schedules.
   * Secured with JWT token and requires "Schedule:List" permission.
   *
   * @returns An array of schedule objects.
   */
  @Tags("Schedule")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Schedule:List", "Tenant"])
  public async getSchedules(@Request() request: ContextualRequest, @Query() startDate?: string, @Query() endDate?: string, @Query() employeeId?: number): Promise<Array<Partial<EmployeeSchedule>>> {
    const { context, user } = request;
    return await context.services.employeeSchedule.list(context, user, {
      startDate, endDate, employeeId
    });
  }

  /**
   * Creates a new schedule with the provided details. This endpoint requires authentication and specific permissions.
   * It utilizes the user's tenant and ID from the JWT token for creating the schedule in the correct context.
   *
   * @param body The properties required to create a new schedule.
   * @returns The created schedule's details, with sensitive information omitted, or null if creation failed.
   */
  @Tags("Schedule")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Schedule:Create", "Tenant"])
  public async createSchedule(@Request() request: ContextualRequest, @Body() body: CreateEmployeeScheduleProperties): Promise<Partial<EmployeeSchedule>> {
    const { context, user } = request;
    return await context.services.employeeSchedule.create(context, user, body);
  }

  /**
   * Creates a new holiday schedule with the provided details.This endpoint requires authentication and specific permissions.
   * It utilizes the user's tenant and ID from the JWT token for creating the schedule in the correct context.
  *
   * @param body The properties required to create a new holiday schedule.
   * @returns The created holiday schedule's details, with sensitive information omitted, or null if creation failed.
  */
  @Tags("Schedule")
  @SuccessResponse("200", "OK")
  @Post("/holiday/add")
  @Security("authentication", ["Schedule:Create", "Tenant"])
  public async addHoliday(@Request() request: ContextualRequest, @Body() body: CreateHolidayScheduleProperties): Promise<Partial<EmployeeSchedule>> {
    const { context, user } = request;
    return await context.services.employeeSchedule.createHoliday(context, user, body);
  }

  /**
   * Remove an existing schedule. This endpoint requires authentication and specific permissions.
   * It utilizes the user's tenant and ID from the JWT token for removing the schedule in the correct context.
   * 
   * @param id  The ID of the schedule to remove.
   */
  @Tags("Schedule")
  @SuccessResponse("200", "OK")
  @Delete("/{id}")
  @Security("authentication", ["Schedule:Delete", "Tenant"])
  public async removeSchedule(@Request() request: ContextualRequest, @Path() id: number): Promise<{ removed: boolean }> {
    const { context } = request;
    return context.services.employeeSchedule.remove(context, id);
  }

  /**
   * Retrieves a list of employees. This endpoint requires authentication and specific permissions.
   * It utilizes the user's tenant and ID from the JWT token for retrieving the employees in the correct context.
   * 
   * @returns An array of employee objects.
   */
  @Tags("Schedule")
  @SuccessResponse("200", "OK")
  @Get("/employee")
  @Security("authentication", ["Schedule:Create", "Tenant"])
  public async getEmployees(@Request() request: ContextualRequest): Promise<Partial<User>[]> {
    const { context, user } = request;
    return await context.services.user.list(context, user.tenant, USER_TYPE.EMPLOYEE, true);
  }

  /**
   * Add an employee to the schedule. This endpoint requires authentication and specific permissions.
   * It utilizes the user's tenant and ID from the JWT token for adding the employee to the schedule in the correct context.
   * 
   * @param body The ID of the employee to add to the schedule.
   * @returns The updated employee object.
   */
  @Tags("Schedule")
  @SuccessResponse("200", "OK")
  @Put("/employee")
  @Security("authentication", ["Schedule:Create", "Tenant"])
  public async addEmployee(@Request() request: ContextualRequest, @Body() body: { id: number }): Promise<Partial<User>> {
    const { context, user } = request;
    return await context.services.user.update(context, user.tenant, body.id, { inSchedule: true }, user.id);
  }

  /**
   * Remove an employee from the schedule. This endpoint requires authentication and specific permissions.
   * It utilizes the user's tenant and ID from the JWT token for removing the employee from the schedule in the correct context.
   * 
   * @param body The ID of the employee to remove from the schedule. 
   */
  @Tags("Schedule")
  @SuccessResponse("200", "OK")
  @Delete("/employee/{id}")
  @Security("authentication", ["Schedule:Create", "Tenant"])
  public async removeEmployee(@Request() request: ContextualRequest, @Path() id: number): Promise<{ removed: boolean }> {
    const { context, user } = request;
    await context.services.user.update(context, user.tenant, id, { inSchedule: false }, user.id);
    return await context.services.employeeSchedule.removeByEmployee(context, id);
  }
};
