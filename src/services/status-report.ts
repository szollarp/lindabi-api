
import { Op } from "sequelize";
import type { Context, DecodedUser } from "../types";
import { CreateStatusReportProperties, StatusReport } from "../models/interfaces/status-report";
import { getRelatedProjectsByStatusReport, getRelatedStatusReports } from "../helpers/status-report";

export interface StatusReportService {
  list: (context: Context, user: DecodedUser) => Promise<Array<Partial<StatusReport>>>;
  get: (context: Context, user: DecodedUser, id: number) => Promise<Partial<StatusReport | null>>;
  create: (context: Context, user: DecodedUser, body: CreateStatusReportProperties) => Promise<Partial<StatusReport> | { exists: boolean }>;
  update: (context: Context, user: DecodedUser, id: number, data: Partial<StatusReport>) => Promise<Partial<StatusReport> | null>;
  getProjects: (context: Context, user: DecodedUser) => Promise<Array<{ id: number, name: string, customer: string, number: string }>>;
}

export const statusReportService = (): StatusReportService => ({
  list, get, getProjects, create, update
});

const list = async (context: Context, user: DecodedUser): Promise<Array<Partial<StatusReport>>> => {
  try {
    return await getRelatedStatusReports(context, user);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const get = async (context: Context, user: DecodedUser, id: number): Promise<Partial<StatusReport | null>> => {
  try {
    return await context.models.StatusReport.findOne({
      where: { id, tenantId: user.tenant },
      include: [{
        model: context.models.User,
        as: "creator",
        attributes: ["id", "name"]
      }, {
        model: context.models.Document,
        as: "documents"
      }, {
        model: context.models.Project,
        as: "project",
        attributes: ["id", "type", "number", "reports"],
        required: true,
        include: [{
          model: context.models.Company,
          as: "contractor",
          attributes: ["id", "name"]
        }]
      }]
    });
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const getProjects = async (context: Context, user: DecodedUser): Promise<Array<{ id: number, name: string, reports: boolean, customer: string, number: string }>> => {
  try {
    return await getRelatedProjectsByStatusReport(context, user);
  } catch (error) {
    throw error;
  }
};

const create = async (context: Context, user: DecodedUser, body: CreateStatusReportProperties): Promise<Partial<StatusReport> | { exists: boolean }> => {
  try {
    // const isExists = await context.models.StatusReport.findOne({
    //   where: {
    //     tenantId: user.tenant,
    //     projectId: body.projectId,
    //     dueDate: {
    //       [Op.eq]: body.dueDate
    //     }
    //   }
    // });

    // if (isExists) {
    //   return { exists: true };
    // }

    return await context.models.StatusReport.create({ ...body, createdBy: user.id, tenantId: user.tenant });
  } catch (error) {
    throw error;
  }
};

const update = async (context: Context, user: DecodedUser, id: number, data: Partial<StatusReport>): Promise<StatusReport | null> => {
  try {
    const statusReport = await context.models.StatusReport.findOne({
      where: { id, tenantId: user.tenant }
    });

    if (!statusReport) {
      return null;
    }

    await statusReport.update({ ...data, updatedBy: user.id });
    return statusReport;
  } catch (error) {
    throw error;
  }
};