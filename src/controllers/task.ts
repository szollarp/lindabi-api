import {
  Controller,
  Route,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Path,
  Body,
  Request,
  SuccessResponse,
  Tags,
  Security
} from "tsoa";
import type { ContextualRequest } from "../types";
import type { Task, CreateTaskProperties } from "../models/interfaces/task";
import type { CreateTaskCommentProperties, TaskComment } from "../models/interfaces/task-comment";
import { TaskColumn } from "../models/interfaces/task-column";
import { User } from "../models/interfaces/user";

@Route("tasks")
export class TaskController extends Controller {
  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("jwtToken", ["Task:List"])
  public async getTasks(@Request() request: ContextualRequest): Promise<{ tasks: Task[], columns: TaskColumn[] }> {
    const { context, user } = request;
    return await context.services.task.list(context, user);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Get("/my")
  @Security("jwtToken", ["Task:List"])
  public async getMyTasks(@Request() request: ContextualRequest): Promise<Task[]> {
    const { context, user } = request;
    return await context.services.task.getMyTasks(context, user);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("jwtToken", ["Task:Get"])
  public async getTask(@Request() request: ContextualRequest, @Path() id: number): Promise<Task | null> {
    const { context, user } = request;
    return await context.services.task.get(context, user, id);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Delete("/{id}")
  @Security("jwtToken", ["Task:Delete"])
  public async deleteTask(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.deleteTask(context, user, id);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("jwtToken", ["Task:Create"])
  public async createTask(@Request() request: ContextualRequest, @Body() body: CreateTaskProperties): Promise<Task> {
    const { context, user } = request;
    return await context.services.task.create(context, user, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/{id}")
  @Security("jwtToken", ["Task:Update"])
  public async updateTask(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Task>): Promise<Task> {
    const { context, user } = request;
    return await context.services.task.update(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/{id}/assign")
  @Security("jwtToken", ["Task:Update"])
  public async assignTask(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { userId: User["id"] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return context.services.task.assign(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/{id}/unassign")
  @Security("jwtToken", ["Task:Update"])
  public async unassignTask(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { userId: User["id"] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return context.services.task.unassign(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Post("/{id}/comments")
  @Security("jwtToken", ["Task:Update"])
  public async addComment(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateTaskCommentProperties): Promise<TaskComment> {
    const { context, user } = request;
    return await context.services.task.addComment(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/comments/{commentId}")
  @Security("jwtToken", ["Task:Update"])
  public async deleteComment(@Request() request: ContextualRequest, @Path() id: number, @Path() commentId: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.deleteComment(context, user, commentId);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Post("/columns")
  @Security("jwtToken", ["TaskColumn:Create"])
  public async createTaskColumn(@Request() request: ContextualRequest, @Body() body: { name: string }): Promise<TaskColumn> {
    const { context, user } = request;
    return await context.services.task.createColumn(context, user, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Delete("/columns/{id}")
  @Security("jwtToken", ["TaskColumn:Delete"])
  public async deleteTaskColumn(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.deleteColumn(context, user, id);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/columns/{id}")
  @Security("jwtToken", ["TaskColumn:Update"])
  public async updateTaskColumn(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<TaskColumn>): Promise<TaskColumn> {
    const { context, user } = request;
    return await context.services.task.updateColumn(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/columns/{id}/cleanup")
  @Security("jwtToken", ["TaskColumn:Update"])
  public async cleanupTaskColumn(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.cleanupColumn(context, user, id);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Put("/columns/reorder")
  @Security("jwtToken", ["TaskColumn:Update"])
  public async moveColumn(@Request() request: ContextualRequest, @Body() body: { position: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.moveColumn(context, user, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Put("/reorder")
  @Security("jwtToken", ["Task:Update"])
  public async moveTask(@Request() request: ContextualRequest, @Body() body: { position: number[], column: number }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.moveTask(context, user, body);
  }
} 
