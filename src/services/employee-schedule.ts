import { Op } from "sequelize";
import type { CreateEmployeeScheduleProperties, CreateHolidayScheduleProperties, EmployeeSchedule, Workspace } from "../models/interfaces/employee-schedule";
import type { Context, DecodedUser } from "../types";
import { USER_STATUS } from "../constants";

type ScheduleQueryParams = {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
};

export interface EmployeeScheduleService {
  list: (context: Context, user: DecodedUser, query: ScheduleQueryParams) => Promise<Array<Partial<EmployeeSchedule>>>
  create: (context: Context, user: DecodedUser, data: CreateEmployeeScheduleProperties) => Promise<EmployeeSchedule>
  createHoliday: (context: Context, user: DecodedUser, data: CreateHolidayScheduleProperties) => Promise<EmployeeSchedule>
  update: (context: Context, user: DecodedUser, id: number, employeeId: number, data: Partial<EmployeeSchedule>) => Promise<EmployeeSchedule>
  remove: (context: Context, id: number) => Promise<{ removed: boolean }>
  removeByEmployee: (context: Context, employeeId: number) => Promise<{ removed: boolean }>
  getTodayWorkspace: (context: Context, user: DecodedUser) => Promise<Workspace[] | []>
}

export const employeeScheduleService = (): EmployeeScheduleService => {
  return { create, createHoliday, update, remove, removeByEmployee, list, getTodayWorkspace };
};

const list = async (context: Context, user: DecodedUser, query: ScheduleQueryParams): Promise<Array<Partial<EmployeeSchedule>>> => {
  try {
    return await context.models.User.findAll({
      attributes: ["id", "name", "email", "entity"],
      where: {
        inSchedule: true,
        tenantId: user.tenant,
        status: USER_STATUS.ACTIVE
      },
      order: [["name", "ASC"]],
      include: [
        {
          model: context.models.EmployeeSchedule,
          as: "schedules",
          attributes: ["id", "startDate", "endDate", "type", "employeeId", "projectId", "type"],
          where: {
            [Op.or]: [
              { startDate: { [Op.between]: [query.startDate, query.endDate] } },
              { endDate: { [Op.between]: [query.startDate, query.endDate] } },
            ]
          },
          required: false,
          include: [
            {
              model: context.models.Project,
              as: "project",
              attributes: ["id", "name", "scheduleColor", "shortName"]
            }
          ],
          order: [["startDate", "ASC"]]
        }
      ]
    });
  } catch (error) {
    throw error;
  }
};

const create = async (context: Context, user: DecodedUser, data: CreateEmployeeScheduleProperties): Promise<EmployeeSchedule> => {
  try {
    return await context.models.EmployeeSchedule.create({
      ...data,
      createdBy: user.id,
      tenantId: user.tenant
    });
  } catch (error) {
    throw error;
  }
};

const createHoliday = async (context: Context, user: DecodedUser, data: CreateHolidayScheduleProperties): Promise<EmployeeSchedule> => {
  try {
    return await context.models.EmployeeSchedule.create({
      ...data,
      type: "not working",
      createdBy: user.id,
      tenantId: user.tenant
    });
  } catch (error) {
    throw error;
  }
};

const update = async (context: Context, user: DecodedUser, id: number, employeeId: number, data: Partial<EmployeeSchedule>): Promise<EmployeeSchedule> => {
  try {
    const employeeSchedule = await context.models.EmployeeSchedule.findOne({
      where: { id, employeeId }
    });

    if (!employeeSchedule) throw new Error("Employee schedule not found");

    return await employeeSchedule.update({
      ...data,
      updatedBy: user.id
    });
  } catch (error) {
    throw error;
  }
};

const removeByEmployee = async (context: Context, employeeId: number): Promise<{ removed: boolean }> => {
  try {
    const employeeSchedule = await context.models.EmployeeSchedule.findOne({
      where: { employeeId }
    });

    if (!employeeSchedule)
      return { removed: false };

    await employeeSchedule.destroy();
    return { removed: true };
  } catch (error) {
    throw error;
  }
}

const remove = async (context: Context, id: number): Promise<{ removed: boolean }> => {
  try {
    const employeeSchedule = await context.models.EmployeeSchedule.findOne({
      where: { id }
    });

    if (!employeeSchedule)
      return { removed: false };

    await employeeSchedule.destroy();
    return { removed: true };
  } catch (error) {
    throw error;
  }
}

const getTodayWorkspace = async (context: Context, user: DecodedUser): Promise<Workspace[] | []> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = await context.models.EmployeeSchedule.findAll({
      where: {
        tenantId: user.tenant,
        employeeId: user.id,
        type: "work",
        [Op.and]: [
          { startDate: { [Op.lte]: tomorrow } },
          { endDate: { [Op.gte]: today } }
        ]
      },
      include: [
        {
          model: context.models.Project,
          as: "project",
          attributes: ["id", "number", "name", "shortName"],
          required: false,
          include: [
            {
              model: context.models.ProjectItem,
              as: "items",
              attributes: ["id", "name", "quantity", "unit", "type"],
              required: false
            },
            {
              model: context.models.Location,
              as: "location",
              attributes: ["id", "city", "address", "zipCode", "country", "region", "latitude", "longitude"],
              required: false
            },
            {
              model: context.models.Tender,
              as: "tender",
              attributes: ["id"],
              required: false,
              include: [
                {
                  model: context.models.Location,
                  as: "location",
                  attributes: ["id", "city", "address", "zipCode", "country", "region", "latitude", "longitude"],
                  required: false
                }
              ]
            }
          ]
        }
      ]
    });

    if (!schedules) {
      return [];
    }

    return schedules.map(schedule => {
      const scheduleJson = schedule.toJSON() as any;

      let location = null;
      if (scheduleJson.project?.location) {
        location = scheduleJson.project.location;
      } else if (scheduleJson.project?.tender?.location) {
        location = scheduleJson.project.tender.location;
      }

      return {
        id: scheduleJson.id,
        type: scheduleJson.type,
        startDate: scheduleJson.startDate,
        endDate: scheduleJson.endDate,
        project: scheduleJson.project ? {
          workHours: { start: "07:00", end: "23:55" },
          id: scheduleJson.project.id,
          type: scheduleJson.project.type,
          number: scheduleJson.project.number,
          name: scheduleJson.project.name,
          shortName: scheduleJson.project.shortName,
          items: scheduleJson.project.items,
          location: location
        } : null
      } as any;
    });
  } catch (error) {
    throw error;
  }
}