import type { Context, DecodedUser } from "../types";

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
          required: true,
        },
      ],
      where: { tenantId: user.tenant },
    });

    return projects
      .filter((project) => {
        const { contacts, createdBy } = project.toJSON();

        if (user.isSystemAdmin || createdBy === user.id) {
          return true
        }

        if (Array.isArray(contacts)) {
          return contacts.some(contact => hasPermission(user, "Project:List") && contact.user?.id === user.id);
        }

        return false;
      })
      .map((project) => project.id);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};