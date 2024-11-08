import { Op } from "sequelize";
import type { Context, DecodedUser } from "../types";
import { Project } from "../models/interfaces/project";

const hasPermission = (user: DecodedUser, permission: string): boolean => {
  return user.isSystemAdmin || user.permissions!.includes(permission);
}

export const getRelatedProjectsByExecution = async (context: Context, user: DecodedUser): Promise<Array<Partial<Project>> | []> => {
  try {
    return await context.models.Project.findAll({
      attributes: ["id", "number", "shortName", "type", "reports"],
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
        }
      ],
      where: {
        tenantId: user.tenant
      }
    });
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