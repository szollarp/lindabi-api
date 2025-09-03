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
  Security,
  Query
} from "tsoa";
import type { ContextualRequest } from "../types";
import type { Task, CreateTaskProperties } from "../models/interfaces/task";
import type { CreateTaskCommentProperties, TaskComment } from "../models/interfaces/task-comment";
import { TaskColumn } from "../models/interfaces/task-column";
import { User } from "../models/interfaces/user";
import { CSVExportOptions } from "../helpers/csv";

@Route("tasks")
export class TaskController extends Controller {
  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Get("/")
  @Security("authentication", ["Task:List"])
  public async getTasks(@Request() request: ContextualRequest): Promise<{ tasks: Task[], columns: TaskColumn[] }> {
    const { context, user } = request;
    return await context.services.task.list(context, user);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Get("/resources")
  @Security("authentication", ["Task:List"])
  public async getTasksAsResources(@Request() request: ContextualRequest): Promise<{ tasks: Task[], columns: TaskColumn[] }> {
    const { context, user } = request;
    return await context.services.task.list(context, user);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Get("/my")
  @Security("authentication", ["Task:List"])
  public async getMyTasks(@Request() request: ContextualRequest): Promise<{ tasks: Task[], columns: TaskColumn[] }> {
    const { context, user } = request;
    return await context.services.task.getMyTasks(context, user);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Get("/{id}")
  @Security("authentication", ["Task:Get"])
  public async getTask(@Request() request: ContextualRequest, @Path() id: number): Promise<Task | null> {
    const { context, user } = request;
    return await context.services.task.get(context, user, id);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Delete("/{id}")
  @Security("authentication", ["Task:Delete"])
  public async deleteTask(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.deleteTask(context, user, id);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Post("/")
  @Security("authentication", ["Task:Create"])
  public async createTask(@Request() request: ContextualRequest, @Body() body: CreateTaskProperties): Promise<Task> {
    const { context, user } = request;
    return await context.services.task.create(context, user, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/{id}")
  @Security("authentication", ["Task:Update"])
  public async updateTask(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<Task>): Promise<Task> {
    const { context, user } = request;
    return await context.services.task.update(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/{id}/assign")
  @Security("authentication", ["Task:Update"])
  public async assignTask(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { userId: User["id"] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return context.services.task.assign(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/{id}/unassign")
  @Security("authentication", ["Task:Update"])
  public async unassignTask(@Request() request: ContextualRequest, @Path() id: number, @Body() body: { userId: User["id"] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return context.services.task.unassign(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Post("/{id}/comments")
  @Security("authentication", ["Task:Update"])
  public async addComment(@Request() request: ContextualRequest, @Path() id: number, @Body() body: CreateTaskCommentProperties): Promise<TaskComment> {
    const { context, user } = request;
    return await context.services.task.addComment(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Delete("/{id}/comments/{commentId}")
  @Security("authentication", ["Task:Update"])
  public async deleteComment(@Request() request: ContextualRequest, @Path() id: number, @Path() commentId: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.deleteComment(context, user, commentId);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Post("/columns")
  @Security("authentication", ["TaskColumn:Create"])
  public async createTaskColumn(@Request() request: ContextualRequest, @Body() body: { name: string }): Promise<TaskColumn> {
    const { context, user } = request;
    return await context.services.task.createColumn(context, user, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Delete("/columns/{id}")
  @Security("authentication", ["TaskColumn:Delete"])
  public async deleteTaskColumn(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.deleteColumn(context, user, id);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/columns/{id}")
  @Security("authentication", ["TaskColumn:Update"])
  public async updateTaskColumn(@Request() request: ContextualRequest, @Path() id: number, @Body() body: Partial<TaskColumn>): Promise<TaskColumn> {
    const { context, user } = request;
    return await context.services.task.updateColumn(context, user, id, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Patch("/columns/{id}/cleanup")
  @Security("authentication", ["TaskColumn:Update"])
  public async cleanupTaskColumn(@Request() request: ContextualRequest, @Path() id: number): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.cleanupColumn(context, user, id);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Put("/columns/reorder")
  @Security("authentication", ["TaskColumn:Update"])
  public async moveColumn(@Request() request: ContextualRequest, @Body() body: { position: number[] }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.moveColumn(context, user, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Put("/reorder")
  @Security("authentication", ["Task:Update"])
  public async moveTask(@Request() request: ContextualRequest, @Body() body: { position: number[], column: number }): Promise<{ success: boolean }> {
    const { context, user } = request;
    return await context.services.task.moveTask(context, user, body);
  }

  @Tags("Task")
  @SuccessResponse("200", "OK")
  @Get("/export/csv")
  @Security("authentication", ["Task:List"])
  public async exportTasksToCSV(
    @Request() request: ContextualRequest,
    @Query() includeComments?: boolean,
    @Query() includeAttachments?: boolean,
    @Query() dateFormat?: string,
    @Query() delimiter?: string,
    @Query() columnId?: number,
    @Query() priority?: string,
    @Query() type?: string,
    @Query() assigneeId?: number
  ): Promise<{
    csvContent: string;
    filename: string;
    buffer: Buffer;
    mimeType: string;
    totalTasks: number;
    exportOptions: any;
  }> {
    const { context, user } = request;

    const options: CSVExportOptions = {
      includeComments: includeComments || false,
      includeAttachments: includeAttachments || false,
      dateFormat: dateFormat || 'YYYY-MM-DD',
      delimiter: delimiter || ','
    };

    const result = await context.services.task.exportToCSV(context, user, options, {
      columnId,
      priority,
      type,
      assigneeId
    });

    return {
      ...result,
      totalTasks: result.tasks?.length || 0,
      exportOptions: options
    };
  }
} 
