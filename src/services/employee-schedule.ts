import { Op } from "sequelize";
import type { CreateEmployeeScheduleProperties, CreateHolidayScheduleProperties, EmployeeSchedule } from "../models/interfaces/employee-schedule";
import type { Context, DecodedUser } from "../types";

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
}

export const employeeScheduleService = (): EmployeeScheduleService => {
  return { create, createHoliday, update, remove, removeByEmployee, list };
};

const list = async (context: Context, user: DecodedUser, query: ScheduleQueryParams): Promise<Array<Partial<EmployeeSchedule>>> => {
  try {
    return await context.models.User.findAll({
      attributes: ["id", "name", "email"],
      where: {
        inSchedule: true,
        tenantId: user.tenant,
        entity: "employee"
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
          ]
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