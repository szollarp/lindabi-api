import type { Context } from "../types";
import type { Tender } from "../models/interfaces/tender";
import type { User } from '../models/interfaces/user';

export interface EmailService {
  sendWelcomeNewUserEmail: (context: Context, user: User) => void;
  sendForgottenPasswordEmail: (context: Context, user: User) => void;
  sendTenderPdfEmail: (context: Context, tenderId: number, htmlBody: string, name: string) => void;
  sendTemplatedEmail: (context: Context, to: string, subject: string, htmlBody: string) => void;
}

export const emailService = (): EmailService => {
  const sendTemplatedEmail = async (context: Context, to: string, subject: string, htmlBody: string): Promise<void> => {
    const emailBody = JSON.stringify({ to, subject, htmlBody });
    await context.helpers.serviceBus.send("email-queue", { body: emailBody });
  }

  const sendWelcomeNewUserEmail = async (context: Context, user: User) => {
    const body = JSON.stringify({ template: "welcome", user: user.id });
    await context.helpers.serviceBus.send("email-queue", { body });
  };

  const sendForgottenPasswordEmail = async (context: Context, user: User) => {
    const body = JSON.stringify({ template: "forgotten-password", user: user.id });
    await context.helpers.serviceBus.send("email-queue", { body });
  };

  const sendTenderPdfEmail = async (context: Context, tenderId: number, htmlBody: string, name: string) => {
    const body = JSON.stringify({ template: "send-tender", tender: tenderId, htmlBody, name });
    await context.helpers.serviceBus.send("email-queue", { body });
  }

  return {
    sendTemplatedEmail,
    sendWelcomeNewUserEmail,
    sendForgottenPasswordEmail,
    sendTenderPdfEmail
  }
};