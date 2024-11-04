import { Op } from "sequelize";
import getTenderCreateTemplate from "../helpers/notification-template/create-tender";
import getUpdateTenderStatusTemplate from "../helpers/notification-template/update-tender-status";
import getWaitingApprovalTenderStatusTemplate from "../helpers/notification-template/tender-waiting-approval";
import getApprovedTenderStatusTemplate from "../helpers/notification-template/tender-approved";
import getCreateUserTemplate from "../helpers/notification-template/create-user";
import getDisableUserTemplate from "../helpers/notification-template/disable-user";
import getUpdateUserTemplate from "../helpers/notification-template/update-user";
import getUpdatePermissionMatrixTemplate from "../helpers/notification-template/update-permission-matrix";
import getCreteContactTemplate from "../helpers/notification-template/create-contact";
import getUpdateContactTemplate from "../helpers/notification-template/update-contact";
import getCreteCustomerTemplate from "../helpers/notification-template/create-customer";
import getUpdateCustomerTemplate from "../helpers/notification-template/update-customer";
import getCreteContractorTemplate from "../helpers/notification-template/create-contractor";
import getUpdateContractorTemplate from "../helpers/notification-template/update-contractor";
import getCreateOrderFormTemplate from "../helpers/notification-template/create-order-form";
import { TENDER_STATUS, USER_STATUS } from "../constants";
import type { Context } from "../types";
import type { Tender } from "../models/interfaces/tender";
import type { User } from "../models/interfaces/user";
import type { Company } from "../models/interfaces/company";
import type { Contact } from "../models/interfaces/contact";
import type { OrderForm } from "../models/interfaces/order-form";

export interface NotificationService {
  sendTenderCreatedNotification: (context: Context, tender: Partial<Tender>) => Promise<{ success: boolean }>
  sendTenderStatusChangedNotification: (context: Context, tenderId: number, status: string) => Promise<{ success: boolean }>
  sendUserCreatedNotification: (context: Context, user: Partial<User>) => Promise<{ success: boolean }>
  sendUserUpdateNotification: (context: Context, user: Partial<User>) => Promise<{ success: boolean }>
  sendUserDeleteNotification: (context: Context, user: Partial<User>) => Promise<{ success: boolean }>
  sendPermissionMatrixUpdateNotification: (context: Context) => Promise<{ success: boolean }>
  sendContactCreatedNotification: (context: Context, contact: Partial<Contact>) => Promise<{ success: boolean }>
  sendContactUpdateNotification: (context: Context, contact: Partial<Contact>) => Promise<{ success: boolean }>
  sendCustomerCreatedNotification: (context: Context, customer: Company) => Promise<{ success: boolean }>
  sendCustomerUpdateNotification: (context: Context, company: Company) => Promise<{ success: boolean }>
  sendContractorCreatedNotification: (context: Context, customer: Company) => Promise<{ success: boolean }>
  sendContractorUpdateNotification: (context: Context, company: Company) => Promise<{ success: boolean }>
  sendOrderFormCreateNotification: (context: Context, orderForm: OrderForm) => Promise<{ success: boolean }>
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
          where: {
            name: {
              [Op.in]: permissions
            }
          }
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
    const users = await fetchUsersWithPermissions(context, ["Tender:Approver", "Tender:Admin", "Tender:Editor", "System:*"], "tenderNew");
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
      const users = await fetchUsersWithPermissions(context, ["Tender:Approver", "Tender:Admin", "System:*"], "tenderAwaitingApproval");
      return sendNotification(context, users, "Ajánlat jóváhagyásra vár állapotba került", () =>
        getWaitingApprovalTenderStatusTemplate(tender!, updateUser!, href, status));
    }

    if (tender!.status === TENDER_STATUS.FINALIZED) {
      const users = await fetchUsersWithPermissions(context, ["Tender:Approver", "Tender:Admin", "Tender:Editor", "System:*"], "tenderApproved");
      return sendNotification(context, users, "Ajánlat végleges állapotba került", () =>
        getApprovedTenderStatusTemplate(tender!, updateUser!, href, status));
    }

    const users = await fetchUsersWithPermissions(context, ["Tender:Approver", "Tender:Admin", "Tender:Editor", "System:*"], "tenderStatusChange");
    return sendNotification(context, users, "Ajánlaton állapotváltás történt", () =>
      getUpdateTenderStatusTemplate(tender!, updateUser!, href, status));
  };

  const sendUserCreatedNotification = async (context: Context, user: Partial<User>): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "userNew");
    const createdBy = await findUserById(context, user.createdBy!);

    return sendNotification(context, users, "Új felhasználó rögzítésre került", () =>
      getCreateUserTemplate(user, createdBy!));
  };

  const sendUserUpdateNotification = async (context: Context, user: Partial<User>): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "userUpdate");
    const updateBy = await findUserById(context, user.updatedBy!);

    return sendNotification(context, users, "A felhasználó módosításra került", () =>
      getUpdateUserTemplate(user, updateBy!));
  };

  const sendUserDeleteNotification = async (context: Context, user: Partial<User>): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "userDelete");
    const updateBy = await findUserById(context, user.updatedBy!);

    return sendNotification(context, users, "A felhasználó inaktiválásra került", () =>
      getDisableUserTemplate(user, updateBy!));
  };

  const sendPermissionMatrixUpdateNotification = async (context: Context): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "permissionMatrixUpdate");

    return sendNotification(context, users, "A szerepkör-jogosultság mátrix módosításra került", () =>
      getUpdatePermissionMatrixTemplate());
  };

  const sendContactCreatedNotification = async (context: Context, contact: Partial<Contact>): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "contactNew");
    const createdBy = await findUserById(context, contact.createdBy!);

    return sendNotification(context, users, "Új kapcsolattartó rögzítésre került", () =>
      getCreteContactTemplate(contact, createdBy!));
  };

  const sendContactUpdateNotification = async (context: Context, contact: Partial<Contact>): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "contactUpdate");
    const updateBy = await findUserById(context, contact.updatedBy!);

    return sendNotification(context, users, "A kapcsolattartó módosításra került", () =>
      getUpdateContactTemplate(contact, updateBy!));
  };

  const sendCustomerCreatedNotification = async (context: Context, company: Company): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "customerNew");
    const createdBy = await findUserById(context, company.createdBy!);

    return sendNotification(context, users, "Új megrendelő rögzítésre került", () =>
      getCreteCustomerTemplate(company, createdBy!));
  };

  const sendCustomerUpdateNotification = async (context: Context, company: Company): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "customerUpdate");
    const updateBy = await findUserById(context, company.updatedBy!);

    return sendNotification(context, users, "A megrendelő módosításra került", () =>
      getUpdateCustomerTemplate(company, updateBy!));
  };

  const sendContractorCreatedNotification = async (context: Context, company: Company): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "contractorNew");
    const createdBy = await findUserById(context, company.createdBy!);

    return sendNotification(context, users, "Új kivitelező rögzítésre került", () =>
      getCreteContractorTemplate(company, createdBy!));
  };

  const sendContractorUpdateNotification = async (context: Context, company: Company): Promise<{ success: boolean }> => {
    const users = await fetchUsersWithPermissions(context, ["System:*"], "contractorUpdate");
    const updateBy = await findUserById(context, company.updatedBy!);

    return sendNotification(context, users, "A kivitelező módosításra került", () =>
      getUpdateContractorTemplate(company, updateBy!));
  };

  const sendOrderFormCreateNotification = async (context: Context, orderForm: OrderForm): Promise<{ success: boolean }> => {
    const users = await context.models.User.findAll({
      where: { id: orderForm.employeeId }, attributes: ["id", "name", "email"]
    });

    const project = await context.models.Project.findOne({
      where: { id: orderForm.projectId },
      attributes: ["id", "name"],
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
      ]
    })

    const [employee,] = users;
    return sendNotification(context, users, "Új megrendőlapja jött létre", () =>
      getCreateOrderFormTemplate(orderForm, project!, employee!));
  };

  return {
    sendTenderCreatedNotification,
    sendTenderStatusChangedNotification,
    sendUserCreatedNotification,
    sendUserUpdateNotification,
    sendUserDeleteNotification,
    sendPermissionMatrixUpdateNotification,
    sendContactCreatedNotification,
    sendContactUpdateNotification,
    sendCustomerCreatedNotification,
    sendCustomerUpdateNotification,
    sendContractorCreatedNotification,
    sendContractorUpdateNotification,
    sendOrderFormCreateNotification
  }
}