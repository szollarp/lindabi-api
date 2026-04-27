import config from "config";
import type { Context } from "../types";
import type { User } from '../models/interfaces/user';

export interface EmailService {
  sendWelcomeNewUserEmail: (context: Context, user: User) => void;
  sendForgottenPasswordEmail: (context: Context, user: User) => void;
  sendTenderPdfEmail: (context: Context, tenderId: number, htmlBody: string, name: string) => void;
  sendTemplatedEmail: (context: Context, to: string, subject: string, htmlBody: string) => void;
  sendSurveyEmail: (context: Context, tenderId: number, token: string) => void;
}

export const emailService = (): EmailService => {
  const emailQueue = config.get<string>("serviceBus.queues.email");

  const sendTemplatedEmail = async (context: Context, to: string, subject: string, htmlBody: string): Promise<void> => {
    const emailBody = JSON.stringify({ to, subject, htmlBody });
    await context.helpers.serviceBus.send(emailQueue, { body: emailBody });
  }

  const sendWelcomeNewUserEmail = async (context: Context, user: User) => {
    const body = JSON.stringify({ template: "welcome", user: user.id });
    await context.helpers.serviceBus.send(emailQueue, { body });
  };

  const sendForgottenPasswordEmail = async (context: Context, user: User) => {
    const body = JSON.stringify({ template: "forgotten-password", user: user.id });
    await context.helpers.serviceBus.send(emailQueue, { body });
  };

  const sendTenderPdfEmail = async (context: Context, tenderId: number, htmlBody: string, name: string) => {
    const body = JSON.stringify({ template: "send-tender", tender: tenderId, htmlBody, name });
    await context.helpers.serviceBus.send(emailQueue, { body });
  }

  const sendSurveyEmail = async (context: Context, tenderId: number, token: string): Promise<void> => {
    const body = JSON.stringify({ template: "send-survey", tender: tenderId, token });
    await context.helpers.serviceBus.send(emailQueue, { body });
  }

  return {
    sendTemplatedEmail,
    sendWelcomeNewUserEmail,
    sendForgottenPasswordEmail,
    sendTenderPdfEmail,
    sendSurveyEmail
  }
};