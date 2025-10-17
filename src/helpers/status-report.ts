import { Op } from "sequelize";
import type { Context, DecodedUser } from "../types";
import { Tender } from "../models/interfaces/tender";

const hasPermission = (user: DecodedUser, permission: string): boolean => {
  return user.isSystemAdmin || user.permissions!.includes(permission);
}

export const getRelatedProjectsByStatusReport = async (context: Context, user: DecodedUser): Promise<Array<{ id: number, tender?: Tender, name: string, reports: boolean, customer: string, number: string }>> => {
  try {
    const projects = await context.models.Project.findAll({
      attributes: ["id", "number", "shortName", "type", "reports"],
      include: [
        {
          model: context.models.Company,
          as: "customer",
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
        },
        {
          model: context.models.Contact,
          as: "supervisors",
          attributes: ["id"],
          through: {
            attributes: ["endDate"],
            as: "attributes",
            where: { endDate: null },
          },
          include: [
            {
              model: context.models.User,
              as: "user",
              attributes: ["id"],
              required: true,
            },
          ],
        }
      ],
      where: {
        [Op.and]: [
          { tenantId: user.tenant },
          {
            [Op.or]: [
              { "$supervisors.user.id$": user.id },
              { createdBy: user.id }
            ]
          }
        ]
      }
    });

    return projects.map(project => {
      const { id, shortName, type, reports, customer, number, tender } = project;
      return { id, tender, name: shortName || type, reports, customer: customer!.name, number: number || "" };
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const getRelatedStatusReports = async (context: Context, user: DecodedUser) => {
  const where = (user.isSystemAdmin || (user.isManager && hasPermission(user, "Report:List"))) ? { tenantId: user.tenant } : {
    tenantId: user.tenant,
    [Op.or]: [
      { "$project.supervisors.user.id$": user.id },
      { "$project.contacts.user.id$": user.id, availableToClient: true },
      { createdBy: user.id }
    ]
  };

  console.log({ where });

  return await context.models.StatusReport.findAll({
    attributes: ["id", "dueDate", "status", "notes"],
    where,
    include: [{
      model: context.models.User,
      as: "creator",
      attributes: ["id", "name"],
      include: [{
        model: context.models.Role,
        as: "role",
        attributes: ["id", "name"]
      }],
      required: false
    }, {
      model: context.models.Project,
      attributes: ["id", "type", "number"],
      as: "project",
      where: { tenantId: user.tenant },
      required: false,
      include: [{
        model: context.models.Company,
        as: "contractor",
        attributes: ["id", "name"]
      }, {
        model: context.models.Contact,
        as: "supervisors",
        attributes: ["id"],
        through: {
          attributes: ["endDate"],
          as: "attributes",
          where: { endDate: null },
        },
        include: [{
          model: context.models.User,
          as: "user",
          attributes: ["id"]
        }],
        required: false
      }, {
        model: context.models.Contact,
        as: "contacts",
        attributes: ["id"],
        include: [{
          model: context.models.User,
          as: "user",
          attributes: ["id"],
        }],
        required: false
      }],
    }],
  });
}