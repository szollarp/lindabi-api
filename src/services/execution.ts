
import { Op } from "sequelize";
import type { Context, DecodedUser } from "../types";
import { Execution } from "../models/interfaces/execution";
import { getRelatedExecutions, getRelatedProjectsByExecution } from "../helpers/execution";
import { Project } from "../models/interfaces/project";
import { EXECUTION_STATUS } from "../constants";
import { checkUserDocuments } from "./document";

export type CreateResponse = Promise<Partial<Execution> | { invalidEmployeeDocuments?: boolean, exists?: boolean, missingStatusReport?: boolean }>;

export interface ExecutionService {
  list: (context: Context, user: DecodedUser) => Promise<Array<Partial<Execution>>>;
  get: (context: Context, user: DecodedUser, id: number) => Promise<Partial<Execution | null>>;
  create: (context: Context, user: DecodedUser, body: Partial<Execution>) => CreateResponse;
  update: (context: Context, user: DecodedUser, id: number, data: Partial<Execution>) => Promise<Partial<Execution> | null>;
  approve: (context: Context, user: DecodedUser, id: number) => Promise<Execution | null>;
  getProjects: (context: Context, employee: number, user: DecodedUser) => Promise<Array<Partial<Project>>>;
}

export const executionService = (): ExecutionService => ({
  list, get, create, update, approve, getProjects,
});

const list = async (context: Context, user: DecodedUser): Promise<Array<Partial<Execution>>> => {
  try {
    return await getRelatedExecutions(context, user);
  } catch (error) {
    throw error;
  }
};

const get = async (context: Context, user: DecodedUser, id: number): Promise<Partial<Execution | null>> => {
  try {
    return await context.models.Execution.findOne({
      where: { id, tenantId: user.tenant },
      include: [{
        model: context.models.Document,
        as: "documents"
      }, {
        model: context.models.Project,
        attributes: ["id", "type", "number"],
        as: "project",
        required: true,
        include: [{
          model: context.models.Company,
          as: "contractor",
          attributes: ["id", "name"]
        }],
      }, {
        model: context.models.User,
        attributes: ["id", "name"],
        as: "employee"
      }, {
        model: context.models.User,
        attributes: ["id", "name"],
        as: "approver"
      }],
    });
  } catch (error) {
    throw error;
  }
};

const getProjects = async (context: Context, employee: number, user: DecodedUser,): Promise<Array<Partial<Project>>> => {
  try {
    return await getRelatedProjectsByExecution(context, employee, user);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const create = async (context: Context, user: DecodedUser, body: Partial<Execution>): CreateResponse => {
  try {
    const invalidEmployeeDocuments = await checkUserDocuments(context, user.tenant, body.employeeId!);
    if (!!invalidEmployeeDocuments && invalidEmployeeDocuments.length > 0) {
      return { invalidEmployeeDocuments: true };
    }

    const isExists = await context.models.Execution.findOne({
      where: {
        projectId: body.projectId,
        employeeId: body.employeeId,
        dueDate: {
          [Op.eq]: body.dueDate
        }
      }
    });

    if (isExists && isExists.projectItemId !== body.projectItemId) {
      return { exists: true };
    }

    const report = await context.models.StatusReport.findOne({
      where: {
        projectId: body.projectId,
        dueDate: {
          [Op.eq]: body.dueDate
        }
      }
    });

    if (!report) {
      return { missingStatusReport: true };
    }

    return await context.models.Execution.create({
      ...body,
      status: EXECUTION_STATUS.PENDING,
      createdBy: user.id,
      tenantId: user.tenant
    } as Execution);
  } catch (error) {
    throw error;
  }
};

const update = async (context: Context, user: DecodedUser, id: number, data: Partial<Execution>): Promise<Execution | null> => {
  try {
    const execution = await context.models.Execution.findOne({
      where: { id }
    });

    if (!execution) {
      return null;
    }

    await execution.update({ ...data, updatedBy: user.id });
    return execution;
  } catch (error) {
    throw error;
  }
};

const approve = async (context: Context, user: DecodedUser, id: number): Promise<Execution | null> => {
  try {
    const execution = await context.models.Execution.findOne({
      where: { id }
    });

    if (!execution) {
      return null;
    }

    await execution.update({
      status: EXECUTION_STATUS.APPROVED,
      approvedBy: user.id,
      approvedOn: new Date()
    });

    return execution;
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
}