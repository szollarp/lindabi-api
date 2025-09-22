export interface Analytics {
  id: number;
  type: "basket_values" | "quote_success_rate" | "job_profitability" | "quote_date_analytics";
  data: any; // JSON data for the analytics
  period: "daily" | "weekly" | "monthly" | "yearly" | "all_time";
  periodStart: Date;
  periodEnd: Date;
  tenantId: number;
  createdOn: Date;
  updatedOn: Date | null;
  createdBy: number;
  updatedBy: number | null;
}

export interface CreateAnalyticsProperties {
  type: "basket_values" | "quote_success_rate" | "job_profitability" | "quote_date_analytics";
  data: any;
  period: "daily" | "weekly" | "monthly" | "yearly" | "all_time";
  periodStart: Date;
  periodEnd: Date;
  tenantId: number;
  createdBy: number;
  updatedBy?: number | null;
}

// Specific analytics data interfaces
export interface BasketValuesData {
  orderedQuotes: {
    count: number;
    averageValue: number;
    totalValue: number;
  };
  orderedJobs: {
    count: number;
    averageValue: number;
    totalValue: number;
  };
}

export interface QuoteSuccessRateData {
  totalSent: number;
  totalAccepted: number;
  successRate: number;
  pendingQuotes: number;
}

export interface JobProfitabilityData {
  totalJobs: number;
  profitableJobs: number;
  unprofitableJobs: number;
  averageProfitMargin: number;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
}

export interface QuoteDateAnalyticsData {
  monthlyStats: Array<{
    month: string;
    year: number;
    quotesSent: number;
    quotesAccepted: number;
    successRate: number;
    totalValue: number;
  }>;
  yearlyStats: Array<{
    year: number;
    quotesSent: number;
    quotesAccepted: number;
    successRate: number;
    totalValue: number;
  }>;
}
