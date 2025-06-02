import { v4 as uuidv4 } from 'uuid';
import type { Task, CreateTaskProperties } from "../models/interfaces/task";
import { TaskColumn } from "../models/interfaces/task-column";
import type { TaskComment, CreateTaskCommentProperties } from "../models/interfaces/task-comment";
import type { Context, DecodedUser } from "../types";
import { User } from '../models/interfaces/user';
import { Op } from 'sequelize';

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
          { createdBy: user.id }
        ]
      },
      include: [
        {
          model: context.models.TaskColumn,
          as: 'column',
          attributes: ['id', 'name'],
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

  return { success: true };
}

const unassign = async (context: Context, user: DecodedUser, id: number, data: { userId: User["id"] }): Promise<{ success: boolean }> => {
  const task = await context.models.Task.findOne({ where: { id, tenantId: user.tenant } });
  if (!task) throw new Error("Task not found");

  await task.removeAssignee(data.userId);

  return { success: true };
}

const addComment = async (context: Context, user: DecodedUser, taskId: number, data: CreateTaskCommentProperties): Promise<TaskComment> => {
  return context.models.TaskComment.create({ ...data, taskId, createdBy: user.id, tenantId: user.tenant } as TaskComment);
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
  moveTask
});
