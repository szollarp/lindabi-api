import { Op } from "sequelize";
import type { Context } from "../types";
import { TENDER_STATUS, USER_STATUS } from "../constants";
import { Tender } from "../models/interfaces/tender";
import { User } from "../models/interfaces/user";
import { getTenderCreateTemplate } from "../helpers/notification-template/create-tender";
import { getUpdateTenderStatusTemplate } from "../helpers/notification-template/update-tender-status";
import { getWaitingApprovalTenderStatusTemplate } from "../helpers/notification-template/tender-waiting-approval";
import { getApprovedTenderStatusTemplate } from "../helpers/notification-template/tender-approved";

export interface NotificationService {
  sendTenderCreatedNotification: (context: Context, tender: Partial<Tender>) => Promise<{ success: boolean }>
  sendTenderStatusChangedNotification: (context: Context, tenderId: number, status: string) => Promise<{ success: boolean }>
}

export const notificationService = (): NotificationService => {
  const fetchConfigHostname = (context: Context): string => {
    const { hostname }: { hostname: string } = context.config.get("website");
    return hostname;
  };

  const sendEmailToUsers = async (context: Context, users: User[], subject: string, message: string): Promise<void> => {
    for (const user of users) {
      await context.services.email.sendTemplatedEmail(context, user.email, subject, message);
    }
  };

  const fetchUsersWithPermissions = async (context: Context, permissions: string[], notificationType: string): Promise<User[]> => {
    return context.models.User.findAll({
      attributes: ["id", "name", "email"],
      where: { notifications: { [notificationType]: true }, status: USER_STATUS.ACTIVE },
      include: [{
        model: context.models.Role,
        as: "role",
        required: true,
        include: [{
          model: context.models.Permission,
          as: "permissions",
          required: true,
          where: { name: { [Op.in]: permissions } }
        }]
      }]
    });
  };

  const findUserById = async (context: Context, userId: number): Promise<User | null> => {
    return context.models.User.findByPk(userId, { attributes: ["id", "name", "email"] });
  };

  const sendNotification = async (context: Context, users: User[], subject: string, buildMessage: () => string): Promise<{ success: boolean }> => {
    try {
      const message = buildMessage();
      await sendEmailToUsers(context, users, subject, message);
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const sendTenderCreatedNotification = async (context: Context, tender: Partial<Tender>): Promise<{ success: boolean }> => {
    const hostname = fetchConfigHostname(context);
    const users = await fetchUsersWithPermissions(context, ["Tender:Approver", "Tender:Admin", "Tender:Editor"], "tenderNew");
    const createUser = await findUserById(context, tender.createdBy!);
    const href = `${hostname}/dashboard/tender/${tender.id}/edit/`;

    return sendNotification(context, users, "Új ajánlat rögzítésre került", () =>
      getTenderCreateTemplate(tender!, createUser!, href));
  };

  const sendTenderStatusChangedNotification = async (context: Context, tenderId: number, status: string): Promise<{ success: boolean }> => {
    const hostname = fetchConfigHostname(context);
    const tender = await context.models.Tender.findByPk(tenderId, {
      attributes: ["id", "status", "updatedOn", "updatedBy", "type"],
      include: [
        { model: context.models.Location, as: "location", attributes: ["id", "city", "zipCode", "address"] },
        { model: context.models.Company, as: "customer", attributes: ["id", "name"] }
      ]
    });

    const updateUser = await findUserById(context, tender!.updatedBy!);
    const href = `${hostname}/dashboard/tender/${tenderId}/edit/`;

    if (tender!.status === TENDER_STATUS.AWAITING_APPROVAL) {
      const users = await fetchUsersWithPermissions(context, ["Tender:Approver", "Tender:Admin"], "tenderAwaitingApproval");
      return sendNotification(context, users, "Ajánlat jóváhagyásra vár állapotba került", () =>
        getWaitingApprovalTenderStatusTemplate(tender!, updateUser!, href, status));
    }

    if (tender!.status === TENDER_STATUS.FINALIZED) {
      const users = await fetchUsersWithPermissions(context, ["Tender:Approver", "Tender:Admin", "Tender:Editor"], "tenderApproved");
      return sendNotification(context, users, "Ajánlat végleges állapotba került", () =>
        getApprovedTenderStatusTemplate(tender!, updateUser!, href, status));
    }

    const users = await fetchUsersWithPermissions(context, ["Tender:Approver", "Tender:Admin", "Tender:Editor"], "tenderStatusChange");
    return sendNotification(context, users, "Ajánlaton állapotváltás történt", () =>
      getUpdateTenderStatusTemplate(tender!, updateUser!, href, status));
  };

  return {
    sendTenderCreatedNotification,
    sendTenderStatusChangedNotification
  }
}