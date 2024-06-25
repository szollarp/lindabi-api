import React from 'react';
import { renderToBuffer, renderToFile } from "@react-pdf/renderer";
import { WEBSITE_ENDPOINTS } from "../constants";
import getWelcomeNewUserTemplate from "../helpers/email-template/welcome";
import getPasswordResetTemplate from "../helpers/email-template/password-reset";
import { UserModel } from "../models/user";
import type { Context } from "../types";
import { Tender } from "../models/interfaces/tender";
import { generatePdfFilename } from "../helpers/tender";
import TenderPDF from '../react/tender-pdf-template';

export interface EmailService {
  sendWelcomeNewUserEmail: (context: Context, user: UserModel) => Promise<{ success: boolean }>
  sendForgottenPasswordEmail: (context: Context, user: UserModel) => Promise<{ success: boolean }>
  sendTenderPdfEmail: (context: Context, tender: Tender, htmlBody: string) => Promise<{ success: boolean }>
  sendTemplatedEmail: (context: Context, to: string, subject: string, htmlBody: string) => Promise<void>;
}

export const emailService = (): EmailService => {
  const fetchConfigHostname = (context: Context): string => {
    const { hostname }: { hostname: string } = context.config.get("website");
    return hostname;
  };

  const sendTemplatedEmail = async (context: Context, to: string, subject: string, htmlBody: string): Promise<void> => {
    const emailBody = JSON.stringify({ to, subject, htmlBody });
    await context.helpers.serviceBus.send("email-queue", { body: emailBody });
  }

  const sendWelcomeNewUserEmail = async (context: Context, user: UserModel): Promise<{ success: boolean }> => {
    const hostname = fetchConfigHostname(context);

    const accountToken = await user.getAccountVerifyToken();
    const href = `${hostname}/${WEBSITE_ENDPOINTS.ACCOUNT_VERIFY}?token=${accountToken.token}`;
    const loginPage = `${hostname}/${WEBSITE_ENDPOINTS.LOGIN}`;
    const htmlBody = getWelcomeNewUserTemplate(user, href, loginPage);

    try {
      const emailBody = JSON.stringify({ to: user.email, subject: "Üdvözlő levél", htmlBody });
      await context.helpers.serviceBus.send("email-queue", { body: emailBody });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const sendForgottenPasswordEmail = async (context: Context, user: UserModel): Promise<{ success: boolean }> => {
    const hostname = fetchConfigHostname(context);
    const forgottenPasswordToken = await user.getForgottenPasswordToken();
    const href = `${hostname}/${WEBSITE_ENDPOINTS.SET_PASSWORD}?token=${forgottenPasswordToken.token}`;
    const htmlBody = getPasswordResetTemplate(user, href);

    try {
      const emailBody = JSON.stringify({ to: user.email, subject: "Jelszó visszaállítási kérelem", htmlBody });
      await context.helpers.serviceBus.send("email-queue", { body: emailBody });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const sendTenderPdfEmail = async (context: Context, tender: Tender, htmlBody: string): Promise<{ success: boolean }> => {
    const fileName = generatePdfFilename(tender);
    const element = React.createElement(TenderPDF, { tender });
    const buffer = await renderToBuffer(element);

    const emailBody = JSON.stringify({
      to: tender.contact!.email,
      subject: "Új ajánlata megérkezett.",
      htmlBody,
      attachments: [{
        "Name": fileName,
        "Content": buffer.toString("base64"),
        "ContentType": "pdf/application"
      },]
    });

    try {

      await context.helpers.serviceBus.send("email-queue", { body: emailBody });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  return {
    sendTemplatedEmail,
    sendWelcomeNewUserEmail,
    sendForgottenPasswordEmail,
    sendTenderPdfEmail
  }
};