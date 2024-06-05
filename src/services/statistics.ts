import type { Context } from "../types";

export interface StatisticsService {
  getOverview: (context: Context) => Promise<{ userNum: number, tenderNum: number, invoiceNum: number }>
}



export const statisticsService = (): StatisticsService => {
  const getOverview = async (context: Context): Promise<{ userNum: number, tenderNum: number, invoiceNum: number }> => {
    try {
      const userNum = await context.models.User.count();
      const tenderNum = await context.models.Tender.count();

      return {
        userNum,
        tenderNum,
        invoiceNum: 0
      }
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  return {
    getOverview
  }
}