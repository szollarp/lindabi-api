
import { Op } from "sequelize";
import type { Context, DecodedUser } from "../types";
import { CreateExecutionProperties, Execution } from "../models/interfaces/execution";
import { getRelatedExecutions, getRelatedProjectsByExecution } from "../helpers/execution";
import { Project } from "../models/interfaces/project";
import { EXECUTION_STATUS } from "../constants";
import { checkUserDocuments } from "./document";

export interface ExecutionService {
  getExecutions: (context: Context, user: DecodedUser) => Promise<Array<Partial<Execution>>>;
  getExecution: (context: Context, id: number) => Promise<Partial<Execution | null>>;
  getRelatedProjects: (context: Context, user: DecodedUser) => Promise<Array<Partial<Project>>>;
  createExecution: (context: Context, user: DecodedUser, body: Partial<Execution>) => Promise<Partial<Execution> | { invalidEmployeeDocuments?: boolean, exists?: boolean, missingStatusReport?: boolean }>;
  updateExecution: (context: Context, id: number, user: DecodedUser, data: Partial<Execution>) => Promise<Partial<Execution> | null>;
  approveExecution: (context: Context, id: number, user: DecodedUser) => Promise<Execution | null>;
}

export const executionService = (): ExecutionService => ({
  getExecutions,
  getExecution,
  getRelatedProjects,
  createExecution,
  updateExecution,
  approveExecution
});

const getExecutions = async (context: Context, user: DecodedUser): Promise<Array<Partial<Execution>>> => {
  try {
    return await getRelatedExecutions(context, user);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const getExecution = async (context: Context, id: number): Promise<Partial<Execution | null>> => {
  try {
    return await context.models.Execution.findOne({
      where: { id },
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

const getRelatedProjects = async (context: Context, user: DecodedUser): Promise<Array<Partial<Project>>> => {
  try {
    return await getRelatedProjectsByExecution(context, user);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const createExecution = async (context: Context, user: DecodedUser, body: Partial<Execution>): Promise<Partial<Execution> | { invalidEmployeeDocuments?: boolean, exists?: boolean, missingStatusReport?: boolean }> => {
  try {
    const invalidEmployeeDocuments = await checkUserDocuments(context, user.tenant, body.employeeId!);
    if (invalidEmployeeDocuments.length > 0) {
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

    if (isExists) {
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
      createdBy: user.id
    } as Execution);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const updateExecution = async (context: Context, id: number, user: DecodedUser, data: Partial<Execution>): Promise<Execution | null> => {
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
    context.logger.error(error);
    throw error;
  }
};

const approveExecution = async (context: Context, id: number, user: DecodedUser): Promise<Execution | null> => {
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