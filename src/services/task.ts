import { v4 as uuidv4 } from 'uuid';
import type { Task, CreateTaskProperties, TaskStatistics } from "../models/interfaces/task";
import { TaskColumn } from "../models/interfaces/task-column";
import type { TaskComment, CreateTaskCommentProperties } from "../models/interfaces/task-comment";
import type { Context, DecodedUser } from "../types";
import { User } from '../models/interfaces/user';
import { Op } from 'sequelize';
import { generateTasksCSV, generateCSVFilename, csvToBuffer, getCSVMimeType, CSVExportOptions } from '../helpers/csv';

export interface TaskService {
  list: (context: Context, user: DecodedUser) => Promise<{ tasks: Task[], columns: TaskColumn[] }>;
  get: (context: Context, user: DecodedUser, id: number) => Promise<Task | null>;
  create: (context: Context, user: DecodedUser, data: CreateTaskProperties) => Promise<Task>;
  update: (context: Context, user: DecodedUser, id: number, data: Partial<CreateTaskProperties>) => Promise<Task>;
  deleteTask: (context: Context, user: DecodedUser, id: number) => Promise<{ success: boolean }>;
  getMyTasks: (context: Context, user: DecodedUser) => Promise<{ tasks: Task[], columns: TaskColumn[] }>;
  assign: (context: Context, user: DecodedUser, id: number, data: { userId: User["id"] }) => Promise<{ success: boolean }>;
  unassign: (context: Context, user: DecodedUser, id: number, data: { userId: User["id"] }) => Promise<{ success: boolean }>;
  addComment: (context: Context, user: DecodedUser, taskId: number, data: CreateTaskCommentProperties) => Promise<TaskComment>;
  deleteComment: (context: Context, user: DecodedUser, commentId: number) => Promise<{ success: boolean }>;
  createColumn: (context: Context, user: DecodedUser, data: { name: string }) => Promise<TaskColumn>;
  updateColumn: (context: Context, user: DecodedUser, id: number, data: Partial<TaskColumn>) => Promise<TaskColumn>;
  cleanupColumn: (context: Context, user: DecodedUser, id: number) => Promise<{ success: boolean }>;
  deleteColumn: (context: Context, user: DecodedUser, id: number) => Promise<{ success: boolean }>;
  moveColumn: (context: Context, user: DecodedUser, data: { position: number[] }) => Promise<{ success: boolean }>;
  moveTask: (context: Context, user: DecodedUser, data: { position: number[], column: number }) => Promise<{ success: boolean }>;
  exportToCSV: (context: Context, user: DecodedUser, options?: CSVExportOptions, filters?: { columnId?: number; priority?: string; type?: string; assigneeId?: number }) => Promise<{ csvContent: string; filename: string; buffer: Buffer; mimeType: string; tasks: Task[]; columns: TaskColumn[] }>;
  getTaskStatistics: (context: Context, user: DecodedUser) => Promise<TaskStatistics>;
}

const list = async (context: Context, user: DecodedUser): Promise<{ tasks: Task[], columns: TaskColumn[], ordered: string[] }> => {
  try {
    const tasks = await context.models.Task.findAll({
      order: [['position', 'ASC']],
      where: {
        tenantId: user.tenant
      },
      include: [
        {
          model: context.models.TaskColumn,
          as: 'column',
          required: true
        },
        {
          model: context.models.TaskComment,
          as: 'comments',
          required: false,
          include: [
            {
              model: context.models.User,
              as: 'creator',
              required: true,
              attributes: ['id', 'name'],
              include: [
                {
                  model: context.models.Document,
                  attributes: ["id", "name", "mimeType", "type", "stored"],
                  as: 'documents',
                  required: false,
                  where: {
                    type: 'avatar',
                  }
                }
              ],
            }
          ]
        },
        {
          model: context.models.User,
          as: 'assignee',
          required: false,
          attributes: ['id', 'name'],
          include: [
            {
              model: context.models.Document,
              attributes: ["id", "name", "mimeType", "type", "stored"],
              as: 'documents',
              required: false,
              where: {
                type: 'avatar',
              }
            }
          ],
        },
        {
          model: context.models.User,
          as: 'reporter',
          required: true,
          attributes: ['id', 'name'],
          include: [
            {
              model: context.models.Document,
              attributes: ["id", "name", "mimeType", "type", "stored"],
              as: 'documents',
              required: false,
              where: {
                type: 'avatar',
              }
            }
          ],
        },
        {
          model: context.models.Document,
          attributes: ["id", "name", "mimeType", "type", "stored"],
          as: 'attachments',
          required: false
        }
      ]
    });

    const columns = await context.models.TaskColumn.findAll({
      attributes: ['id', 'uid', 'name', 'position', 'fixed', 'finished'],
      where: {
        tenantId: user.tenant
      },
      order: [['position', 'ASC']]
    });

    return {
      tasks,
      ordered: columns.map((column) => column.uid),
      columns
    }

  } catch (error) {
    console.error("Error fetching tasks and columns:", error);
    throw new Error("Failed to fetch tasks and columns");
  }
};

const get = async (context: Context, user: DecodedUser, id: number): Promise<Task | null> => {
  return context.models.Task.findOne({
    where: { id, tenantId: user.tenant },
  });
};

const getMyTasks = async (context: Context, user: DecodedUser): Promise<{ tasks: Task[], columns: TaskColumn[] }> => {
  try {
    const tasks = await context.models.Task.findAll({
      where: {
        tenantId: user.tenant,
        [Op.or]: [
          { createdBy: user.id },
          {
            '$assignee.id$': user.id
          }
        ]
      },
      include: [
        {
          model: context.models.TaskColumn,
          as: 'column',
          required: true
        },
        {
          model: context.models.User,
          as: 'reporter',
          required: true,
          attributes: ['id', 'name'],
          include: [
            {
              model: context.models.Document,
              attributes: ["id", "name", "mimeType", "type", "stored"],
              as: 'documents',
              required: false,
              where: {
                type: 'avatar',
              }
            }
          ],
        },
        {
          model: context.models.User,
          as: 'assignee',
          required: false,
          attributes: ['id', 'name'],
          include: [
            {
              model: context.models.Document,
              attributes: ["id", "name", "mimeType", "type", "stored"],
              as: 'documents',
              required: false,
              where: {
                type: 'avatar',
              }
            }
          ],
        }
      ]
    });

    const columns = await context.models.TaskColumn.findAll({
      attributes: ['id', 'uid', 'name', 'position', 'fixed', 'finished'],
      where: {
        tenantId: user.tenant
      },
      order: [['position', 'ASC']]
    });

    return { tasks, columns };
  }
  catch (error) {
    console.error("Error fetching my tasks:", error);
    throw new Error("Failed to fetch my tasks");
  }
};

const create = async (context: Context, user: DecodedUser, data: CreateTaskProperties): Promise<Task> => {
  const tomorrow = new Date();
  tomorrow.setDate(new Date().getDate() + 1);

  const numOfTasks = await context.models.Task.count({
    where: {
      tenantId: user.tenant,
      columnId: data.columnId
    }
  });

  return context.models.Task.create({
    uid: uuidv4(),
    ...data,
    dueDate: tomorrow,
    startDate: new Date(),
    createdBy: user.id,
    tenantId: user.tenant,
    position: numOfTasks + 1,
  } as Task);
};

const update = async (context: Context, user: DecodedUser, id: number, data: Partial<CreateTaskProperties>): Promise<Task> => {
  const task = await context.models.Task.findOne({ where: { id, tenantId: user.tenant } });
  if (!task) throw new Error("Task not found");

  return await task.update({ ...data, updatedBy: user.id });
};

const deleteTask = async (context: Context, user: DecodedUser, id: number): Promise<{ success: boolean }> => {
  const deleted = await context.models.Task.destroy({ where: { id, tenantId: user.tenant } });
  return { success: deleted > 0 };
};

const assign = async (context: Context, user: DecodedUser, id: number, data: { userId: User["id"] }): Promise<{ success: boolean }> => {
  const task = await context.models.Task.findOne({ where: { id, tenantId: user.tenant } });
  if (!task) throw new Error("Task not found");

  await task.addAssignee(data.userId);
  await context.services.notification.sendCreateTaskAssignNotification(context, task, data.userId);

  return { success: true };
}

const unassign = async (context: Context, user: DecodedUser, id: number, data: { userId: User["id"] }): Promise<{ success: boolean }> => {
  const task = await context.models.Task.findOne({ where: { id, tenantId: user.tenant } });
  if (!task) throw new Error("Task not found");

  await task.removeAssignee(data.userId);

  return { success: true };
}

const addComment = async (context: Context, user: DecodedUser, taskId: number, data: CreateTaskCommentProperties): Promise<TaskComment> => {
  const comment = await context.models.TaskComment.create({ ...data, taskId, createdBy: user.id, tenantId: user.tenant } as TaskComment);
  if (comment) {
    await context.services.notification.sendCreateTaskCommentNotification(context, comment);
  }

  return comment;
};

const deleteComment = async (context: Context, user: DecodedUser, commentId: number): Promise<{ success: boolean }> => {
  const deleted = await context.models.TaskComment.destroy({ where: { id: commentId, tenantId: user.tenant } });
  return { success: deleted > 0 };
};

const createColumn = async (context: Context, user: DecodedUser, data: { name: string }): Promise<TaskColumn> => {
  const columnNum = await context.models.TaskColumn.count({ where: { tenantId: user.tenant } });
  return context.models.TaskColumn.create({ uid: uuidv4(), ...data, createdBy: user.id, tenantId: user.tenant, position: columnNum + 1 } as TaskColumn);
}

const updateColumn = async (context: Context, user: DecodedUser, id: number, data: Partial<TaskColumn>): Promise<TaskColumn> => {
  const column = await context.models.TaskColumn.findOne({ where: { id, tenantId: user.tenant } });
  if (!column) throw new Error("Task column not found");

  return await column.update({ ...data, updatedBy: user.id });
};

const cleanupColumn = async (context: Context, user: DecodedUser, id: number): Promise<{ success: boolean }> => {
  const deleted = await context.models.Task.destroy({ where: { columnId: id, tenantId: user.tenant } });
  return { success: deleted > 0 };
};

const deleteColumn = async (context: Context, user: DecodedUser, id: number): Promise<{ success: boolean }> => {
  const deleted = await context.models.TaskColumn.destroy({ where: { id, tenantId: user.tenant } });

  return { success: deleted > 0 };
};

const moveColumn = async (context: Context, user: DecodedUser, data: { position: number[] }): Promise<{ success: boolean }> => {
  for (let i = 0; i < data.position.length; i++) {
    const id = data.position[i];
    await context.models.TaskColumn.update({ position: i + 1 }, { where: { tenantId: user.tenant, id } });
  }

  return { success: true };
}

const moveTask = async (context: Context, user: DecodedUser, data: { position: number[], column: number }): Promise<{ success: boolean }> => {
  for (let i = 0; i < data.position.length; i++) {
    const id = data.position[i];
    await context.models.Task.update({ position: i + 1 }, { where: { tenantId: user.tenant, id, columnId: data.column } });
  }

  return { success: true };
}

const exportToCSV = async (context: Context, user: DecodedUser, options?: CSVExportOptions, filters?: { columnId?: number; priority?: string; type?: string; assigneeId?: number }): Promise<{ csvContent: string; filename: string; buffer: Buffer; mimeType: string; tasks: Task[]; columns: TaskColumn[] }> => {
  const whereClause: any = { tenantId: user.tenant };

  if (filters?.columnId) {
    whereClause.columnId = filters.columnId;
  }

  if (filters?.priority) {
    whereClause.priority = filters.priority;
  }

  if (filters?.type) {
    whereClause.type = filters.type;
  }

  const tasks = await context.models.Task.findAll({
    where: whereClause,
    include: [
      {
        model: context.models.TaskColumn,
        as: 'column',
        required: true,
        attributes: ['name'],
      },
      {
        model: context.models.User,
        as: 'assignee',
        required: false,
        attributes: ['name'],
        ...(filters?.assigneeId && { where: { id: filters.assigneeId } }),
      },
      {
        model: context.models.User,
        as: 'reporter',
        required: true,
        attributes: ['name'],
      },
      {
        model: context.models.TaskComment,
        as: 'comments',
        required: false,
        include: [
          {
            model: context.models.User,
            as: 'creator',
            required: true,
            attributes: ['name'],
          },
        ],
      },
    ],
    order: [
      ['column', 'position'],
      ['position', 'ASC'],
    ],
  });

  const columns = await context.models.TaskColumn.findAll({
    attributes: ['id', 'name', 'position'],
    where: { tenantId: user.tenant },
    order: [['position', 'ASC']]
  });

  const exportData = { tasks, columns };
  const csvContent = generateTasksCSV(exportData, options);
  const filename = generateCSVFilename('tasks');
  const buffer = csvToBuffer(csvContent);
  const mimeType = getCSVMimeType();

  return { csvContent, filename, buffer, mimeType, tasks, columns };
};

const getTaskStatistics = async (context: Context, user: DecodedUser): Promise<TaskStatistics> => {
  try {
    const now = new Date();

    // Get all task columns to understand which ones are "finished" (completed)
    const columns = await context.models.TaskColumn.findAll({
      where: { tenantId: user.tenant },
      attributes: ['id', 'finished']
    });

    const finishedColumnIds = columns
      .filter(column => column.finished)
      .map(column => column.id);

    const inProgressColumnIds = columns
      .filter(column => !column.finished)
      .map(column => column.id);

    // Count total assigned tasks (tasks that have assignees) - using DISTINCT to avoid counting duplicates
    const totalAssignedTasks = await context.models.Task.count({
      where: {
        tenantId: user.tenant,
        [Op.and]: [
          {
            [Op.or]: [
              { '$assignee.id$': { [Op.ne]: null } }
            ]
          }
        ]
      },
      include: [
        {
          model: context.models.User,
          as: 'assignee',
          required: true,
          attributes: []
        }
      ],
      distinct: true
    });

    // Count total unassigned tasks (tasks that don't have assignees)
    const totalUnassignedTasks = await context.models.Task.count({
      where: {
        tenantId: user.tenant,
        [Op.and]: [
          {
            [Op.or]: [
              { '$assignee.id$': { [Op.is]: null } }
            ]
          }
        ]
      },
      include: [
        {
          model: context.models.User,
          as: 'assignee',
          required: false,
          attributes: []
        }
      ],
      distinct: true
    });

    // Count tasks in progress (ALL tasks in non-finished columns, with or without assignees)
    const tasksInProgress = await context.models.Task.count({
      where: {
        tenantId: user.tenant,
        columnId: { [Op.in]: inProgressColumnIds }
      }
    });

    // Count overdue tasks (ALL tasks in non-finished columns that are past their due date, with or without assignees)
    const overdueTasks = await context.models.Task.count({
      where: {
        tenantId: user.tenant,
        columnId: { [Op.in]: inProgressColumnIds },
        dueDate: { [Op.lt]: now }
      }
    });

    // Get overdue tasks by user (only tasks that have assignees)
    const overdueTasksByUser = await context.models.Task.findAll({
      where: {
        tenantId: user.tenant,
        columnId: { [Op.in]: inProgressColumnIds },
        dueDate: { [Op.lt]: now },
        [Op.and]: [
          {
            [Op.or]: [
              { '$assignee.id$': { [Op.ne]: null } }
            ]
          }
        ]
      },
      include: [
        {
          model: context.models.User,
          as: 'assignee',
          required: true,
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id']
    });

    // Group overdue tasks by user
    const userOverdueMap = new Map<number, { userId: number; userName: string; overdueCount: number }>();

    overdueTasksByUser.forEach(task => {
      task.assignee?.forEach(assignee => {
        const existing = userOverdueMap.get(assignee.id);
        if (existing) {
          existing.overdueCount += 1;
        } else {
          userOverdueMap.set(assignee.id, {
            userId: assignee.id,
            userName: assignee.name,
            overdueCount: 1
          });
        }
      });
    });

    const overdueTasksByUserArray = Array.from(userOverdueMap.values());

    return {
      totalAssignedTasks,
      totalUnassignedTasks,
      tasksInProgress,
      overdueTasks,
      overdueTasksByUser: overdueTasksByUserArray
    };
  } catch (error) {
    console.error("Error fetching task statistics:", error);
    throw new Error("Failed to fetch task statistics");
  }
};

export const taskService = (): TaskService => ({
  list,
  get,
  create,
  update,
  getMyTasks,
  assign,
  unassign,
  addComment,
  deleteComment,
  createColumn,
  updateColumn,
  deleteColumn,
  cleanupColumn,
  deleteTask,
  moveColumn,
  moveTask,
  exportToCSV,
  getTaskStatistics
});
