import type { Context } from "../types";
import { TENDER_STATUS, PROJECT_STATUS } from "../constants";
import { AnalyticsCalculator } from "../helpers/analytics-calculator";
import type {
  BasketValuesData,
  QuoteSuccessRateData,
  JobProfitabilityData,
  QuoteDateAnalyticsData
} from "../models/interfaces/analytics";

// Re-export the interfaces for backward compatibility
export type BasketValuesAnalytics = BasketValuesData;
export type QuoteSuccessRateAnalytics = QuoteSuccessRateData;
export type JobProfitabilityAnalytics = JobProfitabilityData;
export type QuoteDateAnalytics = QuoteDateAnalyticsData;

export interface StatisticsService {
  getOverview: (context: Context) => Promise<{ userNum: number, tenderNum: number, invoiceNum: number }>;
  getBasketValues: (context: Context, tenantId: number, forceRecalculate?: boolean) => Promise<BasketValuesAnalytics>;
  getQuoteSuccessRate: (context: Context, tenantId: number, forceRecalculate?: boolean) => Promise<QuoteSuccessRateAnalytics>;
  getJobProfitability: (context: Context, tenantId: number, forceRecalculate?: boolean) => Promise<JobProfitabilityAnalytics>;
  getQuoteDateAnalytics: (context: Context, tenantId: number, forceRecalculate?: boolean) => Promise<QuoteDateAnalytics>;
  triggerAnalyticsUpdate: (context: Context, tenantId: number, userId: number) => Promise<void>;
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

  const getBasketValues = async (context: Context, tenantId: number, forceRecalculate: boolean = false): Promise<BasketValuesAnalytics> => {
    try {
      if (forceRecalculate) {
        const calculator = new AnalyticsCalculator(context);
        return await calculator.calculateBasketValues(tenantId);
      }

      // Try to get pre-calculated data first
      const analytics = await context.models.Analytics.findOne({
        where: {
          tenantId,
          type: 'basket_values',
          period: 'all_time'
        },
        order: [['updatedOn', 'DESC']]
      });

      if (analytics) {
        return analytics.data as BasketValuesAnalytics;
      }

      // Fallback to calculation if no pre-calculated data exists
      const calculator = new AnalyticsCalculator(context);
      return await calculator.calculateBasketValues(tenantId);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getQuoteSuccessRate = async (context: Context, tenantId: number, forceRecalculate: boolean = false): Promise<QuoteSuccessRateAnalytics> => {
    try {
      if (forceRecalculate) {
        const calculator = new AnalyticsCalculator(context);
        return await calculator.calculateQuoteSuccessRate(tenantId);
      }

      // Try to get pre-calculated data first
      const analytics = await context.models.Analytics.findOne({
        where: {
          tenantId,
          type: 'quote_success_rate',
          period: 'all_time'
        },
        order: [['updatedOn', 'DESC']]
      });

      if (analytics) {
        return analytics.data as QuoteSuccessRateAnalytics;
      }

      // Fallback to calculation if no pre-calculated data exists
      const calculator = new AnalyticsCalculator(context);
      return await calculator.calculateQuoteSuccessRate(tenantId);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getJobProfitability = async (context: Context, tenantId: number, forceRecalculate: boolean = false): Promise<JobProfitabilityAnalytics> => {
    try {
      if (forceRecalculate) {
        const calculator = new AnalyticsCalculator(context);
        return await calculator.calculateJobProfitability(tenantId);
      }

      // Try to get pre-calculated data first
      const analytics = await context.models.Analytics.findOne({
        where: {
          tenantId,
          type: 'job_profitability',
          period: 'all_time'
        },
        order: [['updatedOn', 'DESC']]
      });

      if (analytics) {
        return analytics.data as JobProfitabilityAnalytics;
      }

      // Fallback to calculation if no pre-calculated data exists
      const calculator = new AnalyticsCalculator(context);
      return await calculator.calculateJobProfitability(tenantId);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getQuoteDateAnalytics = async (context: Context, tenantId: number, forceRecalculate: boolean = false): Promise<QuoteDateAnalytics> => {
    try {
      if (forceRecalculate) {
        const calculator = new AnalyticsCalculator(context);
        return await calculator.calculateQuoteDateAnalytics(tenantId);
      }

      // Try to get pre-calculated data first
      const analytics = await context.models.Analytics.findOne({
        where: {
          tenantId,
          type: 'quote_date_analytics',
          period: 'all_time'
        },
        order: [['updatedOn', 'DESC']]
      });

      if (analytics) {
        return analytics.data as QuoteDateAnalytics;
      }

      // Fallback to calculation if no pre-calculated data exists
      const calculator = new AnalyticsCalculator(context);
      return await calculator.calculateQuoteDateAnalytics(tenantId);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const triggerAnalyticsUpdate = async (context: Context, tenantId: number, userId: number): Promise<void> => {
    try {
      // This would typically be called by the background job
      // For manual triggering, we can calculate and store immediately
      const calculator = new AnalyticsCalculator(context);

      const analytics = await calculator.calculateAllAnalytics(tenantId);

      // Store the calculated analytics
      const now = new Date();
      const periodStart = new Date(0);
      const periodEnd = new Date();

      const upsertPromises = [
        context.models.Analytics.upsert({
          type: 'basket_values',
          data: analytics.basketValues,
          period: 'all_time',
          periodStart,
          periodEnd,
          tenantId,
          createdBy: userId,
          updatedBy: userId
        }),
        context.models.Analytics.upsert({
          type: 'quote_success_rate',
          data: analytics.successRate,
          period: 'all_time',
          periodStart,
          periodEnd,
          tenantId,
          createdBy: userId,
          updatedBy: userId
        }),
        context.models.Analytics.upsert({
          type: 'job_profitability',
          data: analytics.profitability,
          period: 'all_time',
          periodStart,
          periodEnd,
          tenantId,
          createdBy: userId,
          updatedBy: userId
        }),
        context.models.Analytics.upsert({
          type: 'quote_date_analytics',
          data: analytics.dateAnalytics,
          period: 'all_time',
          periodStart,
          periodEnd,
          tenantId,
          createdBy: userId,
          updatedBy: userId
        })
      ];

      await Promise.all(upsertPromises);
      context.logger.info(`Analytics updated for tenant ${tenantId}`);
    } catch (error) {
      context.logger.error('Failed to trigger analytics update:', error);
      throw error;
    }
  }

  return {
    getOverview,
    getBasketValues,
    getQuoteSuccessRate,
    getJobProfitability,
    getQuoteDateAnalytics,
    triggerAnalyticsUpdate
  }
}