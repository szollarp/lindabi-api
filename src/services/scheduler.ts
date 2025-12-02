import * as cron from "node-cron";
import type { Context } from "../types";
import { milestoneNotificationJob } from "../jobs/milestone-notification-job";
import { AnalyticsUpdateJob } from "../jobs/analytics-update-job";
import { employeeDocumentExpirationJob } from "../jobs/employee-document-expiration-job";

export interface SchedulerService {
  start: (context: Context) => void;
  stop: () => void;
  isRunning: () => boolean;
}

export const schedulerService = (): SchedulerService => {
  let isRunning = false;
  const jobs: cron.ScheduledTask[] = [];

  const start = (context: Context): void => {
    if (isRunning) {
      context.logger.warn("Scheduler is already running");
      return;
    }

    context.logger.info("Starting scheduler service");

    const milestoneJob = cron.schedule(
      "0 7 * * *",
      async () => {
        context.logger.info("Running scheduled milestone notification job");
        try {
          const job = milestoneNotificationJob();
          await job.processWithheldMilestones(context);
        } catch (error) {
          context.logger.error("Error running milestone notification job:", error);
        }
      },
      {
        timezone: "Europe/Budapest"
      }
    );

    jobs.push(milestoneJob);
    milestoneJob.start();

    context.logger.info("Scheduled milestone notification job to run daily at 7:00 AM");

    // Add Analytics Update Job
    const analyticsJob = new AnalyticsUpdateJob(context);
    analyticsJob.start();
    context.logger.info("Analytics update job initialized and scheduled");

    // Add Employee Document Expiration Job
    const documentExpirationJob = cron.schedule(
      "0 8 * * *",
      async () => {
        context.logger.info("Running scheduled employee document expiration check job");
        try {
          const job = employeeDocumentExpirationJob();
          await job.checkExpiringDocuments(context);
        } catch (error) {
          context.logger.error("Error running employee document expiration check job:", error);
        }
      },
      {
        timezone: "Europe/Budapest"
      }
    );

    jobs.push(documentExpirationJob);
    documentExpirationJob.start();
    context.logger.info("Scheduled employee document expiration check job to run daily at 8:00 AM");

    isRunning = true;
  };

  const stop = (): void => {
    if (!isRunning) {
      return;
    }

    jobs.forEach(job => {
      job.stop();
    });

    jobs.length = 0;
    isRunning = false;
  };

  return {
    start,
    stop,
    isRunning: () => isRunning
  };
};
