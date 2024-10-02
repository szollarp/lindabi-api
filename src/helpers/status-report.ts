import type { Project } from "../models/interfaces/project";
import type { Context, DecodedUser } from "../types";

const hasPermission = (user: DecodedUser, permission: string): boolean => {
  return user.isSystemAdmin || user.permissions!.includes(permission);
}

export const getRelatedProjectsByStatusReport = async (context: Context, user: DecodedUser): Promise<Array<any>> => {
  const mapProject = (project: Project) => {
    const { supervisors } = project;

    if (user.isSystemAdmin || (user.isManager && hasPermission(user, "StatusReport:List"))) {
      return { id: project.id, name: project.shortName || project.type };
    }

    if (Array.isArray(supervisors)) {
      const hasSupervisor = supervisors.some(supervisor => hasPermission(user, "StatusReport:List") && supervisor.user?.id === user.id);
      return hasSupervisor ? { id: project.id, name: project.shortName || project.type } : false;
    }

    return false;
  }

  try {
    const projects = await context.models.Project.findAll({
      attributes: ["id", "number", "shortName", "type"],
      include: [
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

    return projects.map(mapProject).filter(Boolean);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};