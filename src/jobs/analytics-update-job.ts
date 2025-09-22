import * as cron from 'node-cron';
import { AnalyticsCalculator } from '../helpers/analytics-calculator';
import type { Context } from '../types';
import type {
  BasketValuesData,
  QuoteSuccessRateData,
  JobProfitabilityData,
  QuoteDateAnalyticsData
} from '../models/interfaces/analytics';

export class AnalyticsUpdateJob {
  private context: Context;
  private calculator: AnalyticsCalculator;

  constructor(context: Context) {
    this.context = context;
    this.calculator = new AnalyticsCalculator(context);
  }

  /**
   * Start the analytics update job
   * Runs daily at 2 AM to update all analytics
   */
  public start(): void {
    // Run daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      this.context.logger.info('Starting analytics update job');
      try {
        await this.updateAllAnalytics();
        this.context.logger.info('Analytics update job completed successfully');
      } catch (error) {
        this.context.logger.error('Analytics update job failed:', error);
      }
    });

    this.context.logger.info('Analytics update job scheduled to run daily at 2 AM');
  }

  /**
   * Update analytics for all tenants or a specific tenant
   */
  public async updateAllAnalytics(tenantId?: number): Promise<void> {
    const tenants = tenantId
      ? [{ id: tenantId }]
      : await this.context.models.Tenant.findAll({ attributes: ['id'] });

    for (const tenant of tenants) {
      await this.updateTenantAnalytics(tenant.id);
    }
  }

  /**
   * Update analytics for a specific tenant
   */
  public async updateTenantAnalytics(tenantId: number): Promise<void> {
    this.context.logger.info(`Updating analytics for tenant ${tenantId}`);

    try {
      // Calculate all analytics
      const analytics = await this.calculator.calculateAllAnalytics(tenantId);

      // Update or create analytics records
      await this.upsertAnalytics(tenantId, 'basket_values', analytics.basketValues);
      await this.upsertAnalytics(tenantId, 'quote_success_rate', analytics.successRate);
      await this.upsertAnalytics(tenantId, 'job_profitability', analytics.profitability);
      await this.upsertAnalytics(tenantId, 'quote_date_analytics', analytics.dateAnalytics);

      this.context.logger.info(`Analytics updated successfully for tenant ${tenantId}`);
    } catch (error) {
      this.context.logger.error(`Failed to update analytics for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Upsert analytics data for a specific type and period
   */
  private async upsertAnalytics(
    tenantId: number,
    type: 'basket_values' | 'quote_success_rate' | 'job_profitability' | 'quote_date_analytics',
    data: BasketValuesData | QuoteSuccessRateData | JobProfitabilityData | QuoteDateAnalyticsData
  ): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    await this.context.models.Analytics.upsert({
      type,
      data: data as any,
      period: 'monthly',
      periodStart,
      periodEnd,
      tenantId,
      createdBy: 1, // System user
      updatedBy: 1
    });

    // Also store all-time analytics
    const allTimeStart = new Date(0); // Epoch start
    const allTimeEnd = new Date(); // Now

    await this.context.models.Analytics.upsert({
      type,
      data: data as any,
      period: 'all_time',
      periodStart: allTimeStart,
      periodEnd: allTimeEnd,
      tenantId,
      createdBy: 1, // System user
      updatedBy: 1
    });
  }

  /**
   * Manually trigger analytics update
   */
  public async triggerUpdate(tenantId?: number): Promise<void> {
    this.context.logger.info('Manually triggering analytics update');
    await this.updateAllAnalytics(tenantId);
  }

  /**
   * Get the latest analytics data for a tenant
   */
  public async getLatestAnalytics(
    tenantId: number,
    type: 'basket_values' | 'quote_success_rate' | 'job_profitability' | 'quote_date_analytics',
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time' = 'all_time'
  ): Promise<any> {
    const analytics = await this.context.models.Analytics.findOne({
      where: {
        tenantId,
        type,
        period
      },
      order: [['updatedOn', 'DESC']]
    });

    return analytics?.data || null;
  }
}
