import { Op } from "sequelize";
import { Context, DecodedUser } from "../types";
import { Project } from "../models/interfaces/project";

const hasPermission = (user: DecodedUser, permission: string): boolean => {
  return user.permissions!.includes(permission);
}

export const getRelatedProjectsByOrderForm = async (context: Context, user: DecodedUser): Promise<Array<Partial<Project>> | []> => {
  try {
    return await context.models.Project.findAll({
      attributes: ["id", "number", "name", 'type'],
      include: [
        {
          model: context.models.Location,
          as: "location",
          attributes: ["id", "city", "country", "zipCode", "address"]
        },
        {
          model: context.models.Company,
          as: "customer",
          attributes: ["name"],
        },
        {
          model: context.models.Company,
          as: "contractor",
          attributes: ["name"],
        }
      ],
      where: {
        [Op.and]: [
          { tenantId: user.tenant }
        ]
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const getRelatedOrderForms = async (context: Context, user: DecodedUser) => {
  const where = (user.isSystemAdmin || (user.isManager && hasPermission(user, "OrderForm:List"))) ? {} : {
    [Op.or]: [
      { "$employee.id$": user.id },
      { createdBy: user.id }
    ]
  };

  return await context.models.OrderForm.findAll({
    where,
    attributes: ["id", "number", "amount", "status", "issueDate", "siteHandoverDate", "deadlineDate", "createdOn", "updatedOn"],
    include: [{
      model: context.models.User,
      as: "employee",
      attributes: ["id", "name"]
    }, {
      model: context.models.User,
      as: "manager",
      attributes: ["id", "name"]
    }, {
      model: context.models.Project,
      attributes: ["id", "number", "name", "type"],
      as: "project"
    }, {
      model: context.models.User,
      attributes: ["id", "name"],
      as: "creator"
    }]
  })
};