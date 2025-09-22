import type { Context } from "../types";
import { TENDER_STATUS, PROJECT_STATUS } from "../constants";
import type {
  BasketValuesData,
  QuoteSuccessRateData,
  JobProfitabilityData,
  QuoteDateAnalyticsData
} from "../models/interfaces/analytics";

export class AnalyticsCalculator {
  constructor(private context: Context) { }

  /**
   * Calculate basket values analytics for ordered quotes and jobs
   */
  async calculateBasketValues(tenantId?: number): Promise<BasketValuesData> {
    const whereClause = tenantId ? { tenantId } : {};

    // Get ordered quotes (tenders with status ORDERED)
    const orderedQuotes = await this.context.models.Tender.findAll({
      where: {
        ...whereClause,
        status: TENDER_STATUS.ORDERED
      },
      attributes: ['id', 'fee']
    });

    const quotesCount = orderedQuotes.length;
    const quotesTotalValue = orderedQuotes.reduce((sum, quote) => sum + (quote.fee || 0), 0);
    const quotesAverageValue = quotesCount > 0 ? quotesTotalValue / quotesCount : 0;

    // Get ordered jobs (projects with status ORDERED)
    const orderedJobs = await this.context.models.Project.findAll({
      where: {
        ...whereClause,
        status: PROJECT_STATUS.ORDERED
      },
      attributes: ['id', 'netAmount', 'vatAmount']
    });

    const jobsCount = orderedJobs.length;
    const jobsTotalValue = orderedJobs.reduce((sum, job) => sum + (job.netAmount || 0) + (job.vatAmount || 0), 0);
    const jobsAverageValue = jobsCount > 0 ? jobsTotalValue / jobsCount : 0;

    return {
      orderedQuotes: {
        count: quotesCount,
        averageValue: Math.round(quotesAverageValue * 100) / 100,
        totalValue: Math.round(quotesTotalValue * 100) / 100
      },
      orderedJobs: {
        count: jobsCount,
        averageValue: Math.round(jobsAverageValue * 100) / 100,
        totalValue: Math.round(jobsTotalValue * 100) / 100
      }
    };
  }

  /**
   * Calculate quote success rate analytics
   */
  async calculateQuoteSuccessRate(tenantId?: number): Promise<QuoteSuccessRateData> {
    const whereClause = tenantId ? { tenantId } : {};

    // Get all quotes that were sent
    const sentQuotes = await this.context.models.Tender.findAll({
      where: {
        ...whereClause,
        status: [TENDER_STATUS.SENT, TENDER_STATUS.ORDERED, TENDER_STATUS.FINALIZED]
      }
    });

    // Get accepted quotes (ordered)
    const acceptedQuotes = await this.context.models.Tender.findAll({
      where: {
        ...whereClause,
        status: TENDER_STATUS.ORDERED
      }
    });

    // Get pending quotes (sent but not yet decided)
    const pendingQuotes = await this.context.models.Tender.findAll({
      where: {
        ...whereClause,
        status: TENDER_STATUS.SENT
      }
    });

    const totalSent = sentQuotes.length;
    const totalAccepted = acceptedQuotes.length;
    const successRate = totalSent > 0 ? (totalAccepted / totalSent) * 100 : 0;

    return {
      totalSent,
      totalAccepted,
      successRate: Math.round(successRate * 100) / 100,
      pendingQuotes: pendingQuotes.length
    };
  }

  /**
   * Calculate job profitability analytics
   */
  async calculateJobProfitability(tenantId?: number): Promise<JobProfitabilityData> {
    const whereClause = tenantId ? { tenantId } : {};

    // Get all completed projects
    const completedProjects = await this.context.models.Project.findAll({
      where: {
        ...whereClause,
        status: PROJECT_STATUS.COMPLETED
      },
      attributes: ['id', 'netAmount', 'vatAmount']
    });

    const totalJobs = completedProjects.length;
    let totalRevenue = 0;
    let profitableJobs = 0;
    let unprofitableJobs = 0;
    let totalCosts = 0;

    for (const project of completedProjects) {
      const revenue = (project.netAmount || 0) + (project.vatAmount || 0);
      totalRevenue += revenue;

      // Get invoices for this project to calculate costs
      const projectInvoices = await this.context.models.Invoice.findAll({
        where: {
          projectId: project.id
        },
        attributes: ['netAmount', 'vatAmount', 'type']
      });

      let projectCosts = 0;

      // Calculate costs from project invoices (employee and material invoices represent costs)
      projectInvoices.forEach(invoice => {
        if (invoice.type === 'employee' || invoice.type === 'material') {
          projectCosts += (invoice.netAmount || 0) + (invoice.vatAmount || 0);
        }
      });

      // If no cost invoices found, estimate costs as a percentage of revenue
      if (projectCosts === 0) {
        projectCosts = revenue * 0.7; // Assuming 70% cost ratio as fallback
      }

      totalCosts += projectCosts;

      if (revenue > projectCosts) {
        profitableJobs++;
      } else {
        unprofitableJobs++;
      }
    }

    const netProfit = totalRevenue - totalCosts;
    const averageProfitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    return {
      totalJobs,
      profitableJobs,
      unprofitableJobs,
      averageProfitMargin: Math.round(averageProfitMargin * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCosts: Math.round(totalCosts * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100
    };
  }

  /**
   * Calculate quote date-based analytics
   */
  async calculateQuoteDateAnalytics(tenantId?: number): Promise<QuoteDateAnalyticsData> {
    const whereClause = tenantId ? { tenantId } : {};

    // Get all quotes with their dates
    const allQuotes = await this.context.models.Tender.findAll({
      where: whereClause,
      attributes: ['id', 'status', 'createdOn', 'fee'],
      order: [['createdOn', 'ASC']]
    });

    // Group by month and year
    const monthlyMap = new Map<string, any>();
    const yearlyMap = new Map<number, any>();

    allQuotes.forEach(quote => {
      const date = new Date(quote.createdOn);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

      // Initialize monthly data
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: date.toLocaleString('en-US', { month: 'long' }),
          year,
          quotesSent: 0,
          quotesAccepted: 0,
          totalValue: 0
        });
      }

      // Initialize yearly data
      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          year,
          quotesSent: 0,
          quotesAccepted: 0,
          totalValue: 0
        });
      }

      const monthlyData = monthlyMap.get(monthKey);
      const yearlyData = yearlyMap.get(year);

      // Count quotes sent (any status except inquiry)
      if (quote.status !== TENDER_STATUS.INQUIRY) {
        monthlyData.quotesSent++;
        yearlyData.quotesSent++;
      }

      // Count quotes accepted (ordered)
      if (quote.status === TENDER_STATUS.ORDERED) {
        monthlyData.quotesAccepted++;
        yearlyData.quotesAccepted++;
      }

      // Add to total value
      const value = quote.fee || 0;
      monthlyData.totalValue += value;
      yearlyData.totalValue += value;
    });

    // Calculate success rates
    const monthlyStats = Array.from(monthlyMap.values()).map(data => ({
      ...data,
      successRate: data.quotesSent > 0 ? Math.round((data.quotesAccepted / data.quotesSent) * 100 * 100) / 100 : 0,
      totalValue: Math.round(data.totalValue * 100) / 100
    }));

    const yearlyStats = Array.from(yearlyMap.values()).map(data => ({
      ...data,
      successRate: data.quotesSent > 0 ? Math.round((data.quotesAccepted / data.quotesSent) * 100 * 100) / 100 : 0,
      totalValue: Math.round(data.totalValue * 100) / 100
    }));

    return {
      monthlyStats,
      yearlyStats
    };
  }

  /**
   * Calculate all analytics types at once
   */
  async calculateAllAnalytics(tenantId?: number) {
    const [basketValues, successRate, profitability, dateAnalytics] = await Promise.all([
      this.calculateBasketValues(tenantId),
      this.calculateQuoteSuccessRate(tenantId),
      this.calculateJobProfitability(tenantId),
      this.calculateQuoteDateAnalytics(tenantId)
    ]);

    return {
      basketValues,
      successRate,
      profitability,
      dateAnalytics
    };
  }
}
