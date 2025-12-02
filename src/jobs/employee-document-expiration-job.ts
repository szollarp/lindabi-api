import { Op } from "sequelize";
import { Sequelize } from "sequelize";
import { differenceInDays, startOfDay } from "date-fns";
import moment from "moment";
import type { Context } from "../types";
import type { Document } from "../models/interfaces/document";
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS, NOTIFICATION_PRIORITY } from "../constants";
import { USER_TYPE, USER_STATUS } from "../constants";

export interface EmployeeDocumentExpirationJob {
  checkExpiringDocuments: (context: Context) => Promise<void>;
}

export const employeeDocumentExpirationJob = (): EmployeeDocumentExpirationJob => {
  const checkExpiringDocuments = async (context: Context): Promise<void> => {
    try {
      context.logger.info("Starting employee document expiration check job");

      const today = startOfDay(new Date());

      // Find all documents owned by employees that have an endOfValidity date
      // Using Sequelize.literal to query JSONB field properly in PostgreSQL
      const expiringDocuments = await context.models.Document.findAll({
        where: {
          ownerType: "user",
          [Op.and]: [
            Sequelize.literal("properties->>'endOfValidity' IS NOT NULL"),
            Sequelize.literal("properties->>'endOfValidity' != ''")
          ]
        },
        include: [
          {
            model: context.models.User,
            as: "user",
            where: {
              entity: USER_TYPE.EMPLOYEE,
              status: USER_STATUS.ACTIVE
            },
            attributes: ["id", "name", "email", "tenantId"],
            required: true
          }
        ]
      });

      context.logger.info(`Found ${expiringDocuments.length} employee documents with endOfValidity date`);

      // Filter documents that expire within 7 days
      const documentsExpiringSoon: Array<{ document: Document; employee: any; daysUntilExpiration: number }> = [];

      for (const doc of expiringDocuments) {
        const endOfValidity = doc.properties?.endOfValidity as string | undefined;
        if (!endOfValidity) continue;

        const expirationDate = startOfDay(moment(endOfValidity).toDate());
        const daysUntilExpiration = differenceInDays(expirationDate, today);

        // Check if document expires within 7 days (including today)
        if (daysUntilExpiration >= 0 && daysUntilExpiration <= 7) {
          documentsExpiringSoon.push({
            document: doc,
            employee: doc.user,
            daysUntilExpiration
          });
        }
      }

      context.logger.info(`Found ${documentsExpiringSoon.length} employee documents expiring within 7 days`);

      // Group by tenant to send notifications per tenant
      const documentsByTenant = new Map<number, typeof documentsExpiringSoon>();

      for (const item of documentsExpiringSoon) {
        const tenantId = item.employee.tenantId;
        if (!documentsByTenant.has(tenantId)) {
          documentsByTenant.set(tenantId, []);
        }
        documentsByTenant.get(tenantId)!.push(item);
      }

      // Send notifications for each tenant
      for (const [tenantId, documents] of documentsByTenant.entries()) {
        await sendNotificationsForTenant(context, tenantId, documents);
      }

      context.logger.info("Employee document expiration check job completed successfully");
    } catch (error) {
      context.logger.error("Error in employee document expiration check job:", error);
      throw error;
    }
  };

  const sendNotificationsForTenant = async (
    context: Context,
    tenantId: number,
    documents: Array<{ document: Document; employee: any; daysUntilExpiration: number }>
  ): Promise<void> => {
    try {
      // Get users with appropriate permissions to receive employee document notifications
      const users = await context.models.User.findAll({
        attributes: ["id", "name", "email"],
        where: {
          tenantId,
          status: USER_STATUS.ACTIVE
        },
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
                [Op.in]: ["Employee:Admin", "Employee:Editor", "Employee:Update", "System:*"]
              }
            }
          }]
        }]
      });

      if (users.length === 0) {
        context.logger.warn(`No users found with permissions to receive employee document expiration notifications for tenant ${tenantId}`);
        return;
      }

      // Group documents by employee for better organization
      const documentsByEmployee = new Map<number, typeof documents>();
      for (const item of documents) {
        const employeeId = item.employee.id;
        if (!documentsByEmployee.has(employeeId)) {
          documentsByEmployee.set(employeeId, []);
        }
        documentsByEmployee.get(employeeId)!.push(item);
      }

      // Create email content
      const subject = `Munkavállalói dokumentumok lejárati értesítése`;
      const htmlBody = generateDocumentExpirationEmail(documentsByEmployee);

      // Send email to each user
      for (const user of users) {
        await context.services.email.sendTemplatedEmail(
          context,
          user.email,
          subject,
          htmlBody
        );

        context.logger.info(`Sent employee document expiration notification email to ${user.email} for tenant ${tenantId}`);
      }

      // Also create in-app notifications
      for (const user of users) {
        const employeeCount = documentsByEmployee.size;
        const documentCount = documents.length;
        const message = `${documentCount} dokumentum lejár ${employeeCount} munkavállalónál egy héten belül.`;

        await context.models.Notification.create({
          userId: user.id,
          type: NOTIFICATION_TYPE.GENERAL,
          title: `Munkavállalói dokumentumok lejárati értesítése`,
          status: NOTIFICATION_STATUS.UNREAD,
          priority: NOTIFICATION_PRIORITY.MEDIUM,
          message,
          data: {
            type: "employee_document_expiration",
            tenantId,
            documentCount,
            employeeCount
          }
        });
      }

      context.logger.info(`Successfully sent notifications for ${documents.length} expiring documents in tenant ${tenantId}`);
    } catch (error) {
      context.logger.error(`Error sending notifications for tenant ${tenantId}:`, error);
      throw error;
    }
  };

  const generateDocumentExpirationEmail = (
    documentsByEmployee: Map<number, Array<{ document: Document; employee: any; daysUntilExpiration: number }>>
  ): string => {
    let employeeSections = "";

    for (const [employeeId, documents] of documentsByEmployee.entries()) {
      const employee = documents[0].employee;
      const employeeName = employee.name || employee.email || `Munkavállaló #${employeeId}`;

      let documentList = "";
      for (const item of documents) {
        const doc = item.document;
        const expirationDate = moment(doc.properties?.endOfValidity as string).format("YYYY-MM-DD");
        const daysLeft = item.daysUntilExpiration;
        const daysText = daysLeft === 0 ? "ma" : daysLeft === 1 ? "holnap" : `${daysLeft} nap múlva`;

        documentList += `
          <tr style="border-bottom: 1px solid #dee2e6;">
            <td style="padding: 10px;">${doc.type || "Ismeretlen típus"}</td>
            <td style="padding: 10px;">${expirationDate}</td>
            <td style="padding: 10px; color: ${daysLeft <= 3 ? "#dc3545" : "#856404"};">
              <strong>${daysText}</strong>
            </td>
          </tr>
        `;
      }

      employeeSections += `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">${employeeName}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #e9ecef; border-bottom: 2px solid #dee2e6;">
                <th style="padding: 10px; text-align: left;">Dokumentum típusa</th>
                <th style="padding: 10px; text-align: left;">Lejárati dátum</th>
                <th style="padding: 10px; text-align: left;">Hátralévő idő</th>
              </tr>
            </thead>
            <tbody>
              ${documentList}
            </tbody>
          </table>
        </div>
      `;
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Munkavállalói dokumentumok lejárati értesítése
        </h2>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #856404; margin-top: 0;">⚠️ Figyelem</h4>
          <p style="color: #856404; margin-bottom: 0;">
            A következő munkavállalói dokumentumok lejárnak egy héten belül. Kérjük, tekintse át és frissítse a szükséges dokumentumokat.
          </p>
        </div>
        
        ${employeeSections}
        
        <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
          Ez egy automatikus értesítés a Lindabi Projektmenedzsment Rendszerből.
        </p>
      </div>
    `;
  };

  return {
    checkExpiringDocuments
  };
};

