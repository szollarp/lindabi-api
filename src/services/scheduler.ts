import * as cron from "node-cron";
import type { Context } from "../types";
import { milestoneNotificationJob } from "../jobs/milestone-notification-job";

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
