
import { Op } from "sequelize";
import type { Context, DecodedUser } from "../types";
import { CreateStatusReportProperties, StatusReport } from "../models/interfaces/status-report";
import { getRelatedProjectsByStatusReport, getRelatedStatusReports } from "../helpers/status-report";

export interface StatusReportService {
  getStatusReports: (context: Context, user: DecodedUser) => Promise<Array<Partial<StatusReport>>>;
  getStatusReport: (context: Context, id: number) => Promise<Partial<StatusReport | null>>;
  getRelatedProjects: (context: Context, user: DecodedUser) => Promise<Array<{ id: number, name: string, customer: string, number: string }>>;
  createStatusReport: (context: Context, user: DecodedUser, body: CreateStatusReportProperties) => Promise<Partial<StatusReport> | { exists: boolean }>;
  updateStatusReport: (context: Context, id: number, user: DecodedUser, data: Partial<StatusReport>) => Promise<Partial<StatusReport> | null>;
}

export const statusReportService = (): StatusReportService => ({
  getStatusReports,
  getStatusReport,
  getRelatedProjects,
  createStatusReport,
  updateStatusReport
});

const getStatusReports = async (context: Context, user: DecodedUser): Promise<Array<Partial<StatusReport>>> => {
  try {
    return await getRelatedStatusReports(context, user);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const getStatusReport = async (context: Context, id: number): Promise<Partial<StatusReport | null>> => {
  try {
    return await context.models.StatusReport.findOne({
      where: { id },
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
    throw error;
  }
};

const getRelatedProjects = async (context: Context, user: DecodedUser): Promise<Array<{ id: number, name: string, reports: boolean, customer: string, number: string }>> => {
  try {
    return await getRelatedProjectsByStatusReport(context, user);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const createStatusReport = async (context: Context, user: DecodedUser, body: CreateStatusReportProperties): Promise<Partial<StatusReport> | { exists: boolean }> => {
  try {
    const isExists = await context.models.StatusReport.findOne({
      where: {
        projectId: body.projectId,
        dueDate: {
          [Op.eq]: body.dueDate
        }
      }
    });

    if (isExists) {
      return { exists: true };
    }

    return await context.models.StatusReport.create({ ...body, createdBy: user.id });
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const updateStatusReport = async (context: Context, id: number, user: DecodedUser, data: Partial<StatusReport>): Promise<StatusReport | null> => {
  try {
    const statusReport = await context.models.StatusReport.findOne({
      where: { id }
    });

    if (!statusReport) {
      return null;
    }

    await statusReport.update({ ...data, updatedBy: user.id });
    return statusReport;
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};