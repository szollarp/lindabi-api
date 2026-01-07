import { Op } from "sequelize";
import type { Context } from "../types";
import type {
  CreateTrackingEventProperties,
  TrackingEvent,
  MonthlyWorkStatus,
  DailyWorkStatus
} from "../models/interfaces/tracking-event";

export interface TrackingEventService {
  createEvent: (
    context: Context,
    tenantId: number,
    userId: number,
    body: Omit<CreateTrackingEventProperties, "tenantId" | "createdBy" | "createdOn" | "projectId" | "deletedOn">
  ) => Promise<TrackingEvent>;
  getEventsByDate: (
    context: Context,
    tenantId: number,
    userId: number,
    date: Date,
    projectId?: number
  ) => Promise<TrackingEvent[]>;
  getMonthlyWorkStatus: (
    context: Context,
    tenantId: number,
    userId: number,
    date: Date
  ) => Promise<MonthlyWorkStatus>;
  deleteEvent: (
    context: Context,
    tenantId: number,
    userId: number,
    eventId: number
  ) => Promise<void>;
}

export const trackingEventService = (): TrackingEventService => {
  const createEvent = async (
    context: Context,
    tenantId: number,
    userId: number,
    body: Omit<CreateTrackingEventProperties, "tenantId" | "createdBy" | "createdOn">
  ): Promise<TrackingEvent> => {
    try {
      // Validate eventType is one of the allowed values
      const allowedEventTypes = [
        'entry',
        'exit',
        'gps_signal_lost',
        'gps_signal_recovered',
        'app_background',
        'app_foreground',
        'app_init',
        'note'
      ];

      if (!allowedEventTypes.includes(body.eventType)) {
        throw new Error(`Invalid eventType: ${body.eventType}. Allowed values: ${allowedEventTypes.join(', ')}`);
      }

      return await context.models.TrackingEvent.create({
        ...body,
        tenantId,
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
    projectId?: number
  ): Promise<TrackingEvent[]> => {
    try {
      // Get start and end of the day in UTC
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const whereClause: any = {
        tenantId,
        createdBy: userId,
        eventType: {
          [Op.in]: ["entry", "exit", "note"]
        },
        occurredAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      };

      // Add TrackingId filter if provided
      if (projectId) {
        whereClause.projectId = projectId;
      }

      const events = await context.models.TrackingEvent.findAll({
        where: whereClause,
        paranoid: true,
        order: [['occurredAt', 'ASC']],
        include: [
          {
            model: context.models.Project,
            as: 'project',
            attributes: ['name'],
            include: [
              {
                model: context.models.Location,
                as: 'location',
                attributes: ["id", "name", "latitude", "longitude", "address", "city", "zipCode"]
              }
            ]
          },
          {
            model: context.models.Document,
            as: 'documents',
            attributes: ["id", "name", "type", "mimeType", "stored"]
          }
        ]
      });

      return events;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteEvent = async (
    context: Context,
    tenantId: number,
    userId: number,
    eventId: number
  ): Promise<void> => {
    try {
      // Find the event first to get its data for the audit trail
      const eventToDelete = await context.models.TrackingEvent.findOne({
        where: {
          id: eventId,
          tenantId
        }
      });

      if (!eventToDelete) {
        throw new Error(`Event with ID ${eventId} not found or access denied.`);
      }

      await eventToDelete.destroy();
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    createEvent,
    getEventsByDate,
    deleteEvent,
    getMonthlyWorkStatus: async (
      context: Context,
      tenantId: number,
      userId: number,
      date: Date
    ): Promise<MonthlyWorkStatus> => {
      try {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed

        // Calculate start and end of the month
        const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

        // Get all relevant events for the month including Project info
        const events = await context.models.TrackingEvent.findAll({
          where: {
            tenantId,
            createdBy: userId,
            eventType: {
              [Op.in]: ["entry", "exit", "note"]
            },
            occurredAt: {
              [Op.between]: [startOfMonth, endOfMonth]
            }
          },
          include: [{
            model: context.models.Project,
            as: 'project',
            attributes: ['name']
          }, {
            model: context.models.Document,
            as: 'documents',
            attributes: ["id", "name", "type", "mimeType", "stored"]
          }],
          attributes: ['occurredAt', 'projectId'],
          paranoid: true
        });

        // Group events by day
        const workDays = new Map<string, Set<string>>();
        events.forEach(event => {
          const day = event.occurredAt.toISOString().split('T')[0];
          if (!workDays.has(day)) {
            workDays.set(day, new Set());
          }

          if (event.project && event.project.name) {
            workDays.get(day)?.add(event.project.name);
          }
        });

        const days: DailyWorkStatus[] = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
          // Construct date string manually to avoid timezone issues
          const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const currentDayDate = new Date(currentDayStr);
          const dayOfWeek = currentDayDate.getDay(); // 0 = Sunday, 1 = Monday, ...
          const hasWork = workDays.has(currentDayStr);
          const projectNames = hasWork ? Array.from(workDays.get(currentDayStr) || []) : [];

          let status: 'recorded' | 'missing' | 'none' = 'none';

          if (hasWork) {
            status = 'recorded';
          } else {
            // If it's a weekday (Mon-Fri) and in the past (before today), mark as missing
            // This is a naive implementation as per requirements
            const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;
            const isPast = new Date(currentDayStr) < new Date(new Date().toISOString().split('T')[0]);

            if (isWeekday && isPast) {
              status = 'missing';
            }
          }

          days.push({
            date: currentDayStr,
            status,
            hasWorkLogs: hasWork,
            projectNames
          });
        }

        return {
          month: `${year}-${String(month + 1).padStart(2, '0')}`,
          days
        };
      } catch (error) {
        context.logger.error(error);
        throw error;
      }
    }
  };
};
