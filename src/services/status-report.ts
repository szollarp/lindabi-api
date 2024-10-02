
import type { Context, DecodedUser } from "../types";
import { StatusReport } from "../models/interfaces/status-report";
import { getRelatedProjectsByStatusReport } from "../helpers/status-report";

export interface StatusReportService {
  getStatusReports: (context: Context) => Promise<Array<Partial<StatusReport>>>;
  getRelatedProjects: (context: Context, user: DecodedUser) => Promise<Array<{ id: number, name: string }>>;
}

export const statusReportService = (): StatusReportService => ({
  getStatusReports,
  getRelatedProjects
});

const getStatusReports = async (context: Context): Promise<Array<Partial<StatusReport>>> => {
  try {
    return await context.models.StatusReport.findAll();
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const getRelatedProjects = async (context: Context, user: DecodedUser): Promise<Array<{ id: number, name: string }>> => {
  try {
    return await getRelatedProjectsByStatusReport(context, user);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};