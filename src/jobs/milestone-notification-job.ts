import { Op } from "sequelize";
import { differenceInDays } from "date-fns";
import type { Context } from "../types";
import type { Milestone } from "../models/interfaces/milestone";
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS, NOTIFICATION_PRIORITY } from "../constants";

export interface MilestoneNotificationJob {
  processWithheldMilestones: (context: Context) => Promise<void>;
}

export const milestoneNotificationJob = (): MilestoneNotificationJob => {
  const processWithheldMilestones = async (context: Context): Promise<void> => {
    try {
      context.logger.info("Starting milestone notification job for withheld milestones");

      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const milestonesRequiringNotification = await context.models.Milestone.findAll({
        where: {
          restraintAmount: {
            [Op.ne]: null,
            [Op.gt]: 0
          },
          restraintDate: {
            [Op.ne]: null,
            [Op.gte]: thirtyDaysAgo,
            [Op.lt]: new Date(thirtyDaysAgo.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        include: [
          {
            model: context.models.Project,
            as: "project",
            attributes: ["id", "name", "number"],
            include: [
              {
                model: context.models.Company,
                as: "customer",
                attributes: ["id", "name"]
              }
            ]
          }
        ],
        order: [["restraintDate", "ASC"]]
      });

      context.logger.info(`Found ${milestonesRequiringNotification.length} milestones requiring notification (exactly 30 days since restraint date)`);

      for (const milestone of milestonesRequiringNotification) {
        const daysDifference = differenceInDays(today, milestone.restraintDate!);
        context.logger.info(
          `Milestone ${milestone.id} (${milestone.name}) - restraint date: ${milestone.restraintDate!.toISOString()}, days difference: ${daysDifference}`
        );
      }

      for (const milestone of milestonesRequiringNotification) {
        await sendMilestoneNotification(context, milestone);
      }

      context.logger.info("Milestone notification job completed successfully");
    } catch (error) {
      context.logger.error("Error in milestone notification job:", error);
      throw error;
    }
  };

  const sendMilestoneNotification = async (context: Context, milestone: Milestone): Promise<void> => {
    try {
      // Get users with appropriate permissions to receive milestone notifications
      const users = await context.models.User.findAll({
        attributes: ["id", "name", "email"],
        where: {
          notifications: { milestoneRestraintNotification: true },
          status: "active"
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
                [Op.in]: ["Project:Admin", "Project:Editor", "System:*"]
              }
            }
          }]
        }]
      });

      if (users.length === 0) {
        context.logger.warn(`No users found with permissions to receive milestone notifications for milestone ${milestone.id}`);
        return;
      }

      // Create email content
      const subject = `Mérföldkő visszatartott összege - 30 napos értesítés: ${milestone.name}`;
      const htmlBody = generateMilestoneNotificationEmail(milestone);

      // Send email to each user
      for (const user of users) {
        await context.services.email.sendTemplatedEmail(
          context,
          user.email,
          subject,
          htmlBody
        );

        context.logger.info(`Sent milestone notification email to ${user.email} for milestone ${milestone.id}`);
      }

      // Also create in-app notifications
      for (const user of users) {
        await context.models.Notification.create({
          userId: user.id,
          type: NOTIFICATION_TYPE.GENERAL,
          title: `Mérföldkő visszatartott összege - 30 napos értesítés`,
          status: NOTIFICATION_STATUS.UNREAD,
          priority: NOTIFICATION_PRIORITY.MEDIUM,
          message: `A "${milestone.name}" mérföldkő elérte a 30 napot a visszatartási dátum óta (${milestone.restraintDate?.toLocaleDateString()}). Visszatartott összeg: ${milestone.restraintAmount}`,
          data: {
            type: "milestone",
            id: milestone.id,
            projectId: milestone.projectId
          }
        });
      }

      context.logger.info(`Successfully sent notifications for milestone ${milestone.id}`);
    } catch (error) {
      context.logger.error(`Error sending notification for milestone ${milestone.id}:`, error);
      throw error;
    }
  };

  const generateMilestoneNotificationEmail = (milestone: Milestone): string => {
    const projectName = milestone.project?.name || "Ismeretlen projekt";
    const customerName = milestone.project?.customer?.name || "Ismeretlen ügyfél";
    const restraintDate = milestone.restraintDate?.toLocaleDateString() || "Ismeretlen dátum";
    const restraintAmount = milestone.restraintAmount || 0;

    return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    Mérföldkő visszatartott összege - 30 napos értesítés
                </h2>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #495057; margin-top: 0;">Mérföldkő részletei</h3>
                    <p><strong>Mérföldkő neve:</strong> ${milestone.name}</p>
                    <p><strong>Projekt:</strong> ${projectName}</p>
                    <p><strong>Ügyfél:</strong> ${customerName}</p>
                    <p><strong>Visszatartási dátum:</strong> ${restraintDate}</p>
                    <p><strong>Visszatartott összeg:</strong> ${restraintAmount.toLocaleString()} HUF</p>
                </div>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="color: #856404; margin-top: 0;">⚠️ Intézkedés szükséges</h4>
                    <p style="color: #856404; margin-bottom: 0;">
                        Ez a mérföldkő elérte a 30 napot a visszatartási dátum óta. Kérjük, tekintse át a visszatartott összeget és tegye meg a szükséges intézkedéseket.
                    </p>
                </div>
                
                <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
                    Ez egy automatikus értesítés a Lindabi Projektmenedzsment Rendszerből.
                </p>
            </div>
        `;
  };

  return {
    processWithheldMilestones
  };
};
