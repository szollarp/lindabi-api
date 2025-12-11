import { Op } from "sequelize";
import type { Context } from "../types";
import type {
  CreateWorkSiteEventProperties,
  WorkSiteEvent
} from "../models/interfaces/work-site-event";

export interface WorkSiteEventService {
  createEvent: (
    context: Context,
    tenantId: number,
    userId: number,
    body: Omit<CreateWorkSiteEventProperties, "tenantId" | "userId" | "createdBy" | "createdOn">
  ) => Promise<WorkSiteEvent>;
  getEventsByDate: (
    context: Context,
    tenantId: number,
    userId: number,
    date: Date,
    workSiteId?: string | null
  ) => Promise<WorkSiteEvent[]>;
}

export const workSiteEventService = (): WorkSiteEventService => {
  const createEvent = async (
    context: Context,
    tenantId: number,
    userId: number,
    body: Omit<CreateWorkSiteEventProperties, "tenantId" | "userId" | "createdBy" | "createdOn">
  ): Promise<WorkSiteEvent> => {
    try {
      // Validate eventType is one of the allowed values
      const allowedEventTypes = [
        'first_entry',
        'entry',
        'exit',
        'work_start_at_site',
        'gps_signal_lost',
        'gps_signal_recovered',
        'app_background',
        'app_foreground',
        'app_init'
      ];

      if (!allowedEventTypes.includes(body.eventType)) {
        throw new Error(`Invalid eventType: ${body.eventType}. Allowed values: ${allowedEventTypes.join(', ')}`);
      }

      // Check if this is a "first_entry" event and if one already exists for today
      if (body.eventType === 'first_entry' && body.workSiteId) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const existingFirstEntry = await context.models.WorkSiteEvent.findOne({
          where: {
            tenantId,
            userId,
            workSiteId: body.workSiteId,
            eventType: 'first_entry',
            occurredAt: {
              [Op.between]: [today, endOfDay]
            }
          }
        });

        if (existingFirstEntry) {
          throw new Error('A "first_entry" event already exists for today for this work site');
        }
      }

      return await context.models.WorkSiteEvent.create({
        ...body,
        tenantId,
        userId,
        createdBy: userId
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getEventsByDate = async (
    context: Context,
    tenantId: number,
    userId: number,
    date: Date,
    workSiteId?: string | null
  ): Promise<WorkSiteEvent[]> => {
    try {
      // Get start and end of the day in UTC
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const whereClause: any = {
        tenantId,
        userId,
        eventType: {
          [Op.in]: ["first_entry", "entry", "exit"]
        },
        occurredAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      };

      // Add workSiteId filter if provided
      if (workSiteId) {
        whereClause.workSiteId = workSiteId;
      }

      const events = await context.models.WorkSiteEvent.findAll({
        where: whereClause,
        order: [['occurredAt', 'ASC']]
      });

      return events;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    createEvent,
    getEventsByDate
  };
};
