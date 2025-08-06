import { Op } from "sequelize";
import type { Context, DecodedUser } from "../types";
import { Project } from "../models/interfaces/project";

const hasPermission = (user: DecodedUser, permission: string): boolean => {
  return user.isSystemAdmin || user.permissions!.includes(permission);
}

export const getRelatedProjectsByExecution = async (context: Context, employee: number, user: DecodedUser): Promise<Array<Partial<Project>> | []> => {
  try {
    const schedules = await context.models.EmployeeSchedule.findAll({
      where: {
        tenantId: user.tenant,
        employeeId: employee,
        type: "work"
      },
      attributes: ["id", "startDate", "endDate"],
      include: [{
        model: context.models.Project,
        as: "project",
        attributes: ["id", "number", "name", "shortName", "type", "reports"],
        required: true,
        include: [
          {
            model: context.models.ProjectItem,
            as: "items",
            attributes: ["id", "name", "quantity", "unit"],
          },
          {
            model: context.models.Company,
            as: "contractor",
            attributes: ["id", "name"]
          },
          {
            model: context.models.Tender,
            as: "tender",
            attributes: ["id"],
            required: false,
            include: [{
              model: context.models.Location,
              as: "location",
              attributes: ["id", "city", "address"]
            }]
          }
        ]
      }],
    });

    if (!schedules || schedules.length === 0) {
      return [];
    }

    const projects = schedules.map(schedule => schedule.project);
    return projects.sort((a, b) => a!.name!.localeCompare(b!.name!)) as Array<Partial<Project>>;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const getRelatedExecutions = async (context: Context, user: DecodedUser) => {
  const where = (user.isSystemAdmin || (user.isManager && hasPermission(user, "Execution:List"))) ? { tenantId: user.tenant } : {
    tenantId: user.tenant,
    [Op.or]: [
      { employeeId: user.id },
      { createdBy: user.id }
    ]
  };

  return await context.models.Execution.findAll({
    include: [{
      model: context.models.Project,
      attributes: ["id", "type", "number"],
      as: "project",
      where: { tenantId: user.tenant },
      required: true,
      include: [{
        model: context.models.Company,
        as: "contractor",
        attributes: ["id", "name"]
      }],
    }, {
      model: context.models.User,
      attributes: ["id", "name"],
      as: "employee"
    }],
    where,
    order: [["id", "DESC"]]
  });
}