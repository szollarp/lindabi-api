import { Project } from "../models/interfaces/project";
import type { Context, DecodedUser } from "../types";

export const getNetAmount = (project: Project) => {
  const items = project.items || [];

  return items.reduce(
    (acc, item) => {
      return acc + (item.netAmount ?? 0);
    },
    0
  );
}

export const getVatAmount = (project: Project) => {
  const vatKey = Number(project.vatKey) || 0;

  const netAmount = getNetAmount(project);
  return netAmount * (vatKey / 100);
}

export const getTotalAmount = (project: Project) => {
  const netAmount = getNetAmount(project);
  const vatAmount = getVatAmount(project);
  return netAmount + vatAmount;
}

const hasPermission = (user: DecodedUser, permission: string): boolean => {
  return user.isSystemAdmin || user.permissions!.includes(permission);
}

export const getUserProjectIds = async (context: Context, user: DecodedUser): Promise<number[]> => {
  try {
    const projects = await context.models.Project.findAll({
      attributes: ["id", "createdBy"],
      include: [
        {
          model: context.models.Contact,
          as: "contacts",
          attributes: ["id"],
          through: {
            attributes: ["canShow"],
            as: "attributes",
            where: { canShow: true },
          },
          include: [
            {
              model: context.models.User,
              as: "user",
              attributes: ["id"],
              required: true,
            },
          ],
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
        },
      ],
      where: { tenantId: user.tenant },
    });

    return projects
      .filter((project) => {
        const { contacts, supervisors, createdBy } = project.toJSON();

        if (user.isSystemAdmin || (user.isManager && hasPermission(user, "Project:List")) || (createdBy === user.id && hasPermission(user, "Project:List"))) {
          return true
        }

        if (Array.isArray(contacts)) {
          return contacts.some(contact => hasPermission(user, "Project:List") && contact.user?.id === user.id);
        }

        if (Array.isArray(supervisors)) {
          return supervisors.some(supervisor => hasPermission(user, "Project:List") && supervisor.user?.id === user.id);
        }

        return false;
      })
      .map((project) => project.id);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};