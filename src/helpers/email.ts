import React from 'react';
import { renderToBuffer, renderToFile } from "@react-pdf/renderer";
import { WEBSITE_ENDPOINTS } from "../constants";
import { generatePdfFilename } from "./tender";
import type { Tender } from "../models/interfaces/tender";
import type { Context } from "../types";
import type { UserModel } from "../models/user";
import TenderPDF from '../react/tender-pdf-template';
import { User } from '../models/interfaces/user';

export const sendForgottenPasswordEmail = async (context: Context, user: UserModel): Promise<void> => {
  const { hostname }: { hostname: string } = context.config.get("website");
  const applicationName = context.config.get("applicationName");
  const company: { name: string, address: string } = context.config.get("company");

  const { email, name } = user;
  const forgottenPasswordToken = await user.getForgottenPasswordToken();
  const actionUrl = `${hostname}/${WEBSITE_ENDPOINTS.SET_PASSWORD}?token=${forgottenPasswordToken.token}`;

  const emailBody = JSON.stringify({
    to: email,
    variables: {
      name,
      product_url: hostname,
      product_name: applicationName,
      action_url: actionUrl,
      company_name: company.name,
      company_address: company.address
    },
    template: "password-reset"
  });

  await context.helpers.serviceBus.send("email-queue", { body: emailBody });
};

export const sendRegistrationEmail = async (context: Context, user: UserModel): Promise<void> => {
  const { hostname }: { hostname: string } = context.config.get("website");
  const company: { name: string, address: string } = context.config.get("company");
  const applicationName = context.config.get("applicationName");

  const { email, name } = user;
  const accountToken = await user.getAccountVerifyToken();

  const actionUrl = `${hostname}/${WEBSITE_ENDPOINTS.ACCOUNT_VERIFY}?token=${accountToken.token}`;
  const loginUrl = `${hostname}/${WEBSITE_ENDPOINTS.LOGIN}`;

  const emailBody = JSON.stringify({
    to: email,
    variables: {
      name,
      email,
      action_url: actionUrl,
      product_url: hostname,
      product_name: applicationName,
      login_url: loginUrl,
      company_name: company.name,
      company_address: company.address
    },
    template: "welcome"
  });

  await context.helpers.serviceBus.send("email-queue", { body: emailBody });
};

export const sendTenderPdfEmail = async (context: Context, tender: Tender, message: string): Promise<void> => {
  const fileName = generatePdfFilename(tender);
  const element = React.createElement(TenderPDF, { tender });
  const buffer = await renderToBuffer(element);

  const emailBody = JSON.stringify({
    to: tender.contact!.email,
    subject: "Your new proposal has arrived",
    htmlBody: message,
    attachments: [{
      "Name": fileName,
      "Content": buffer.toString("base64"),
      "ContentType": "pdf/application"
    },]
  });

  await context.helpers.serviceBus.send("email-queue", { body: emailBody });
}

export const sendTemplatedEmail = async (context: Context, to: string, subject: string, htmlBody: string): Promise<void> => {
  const emailBody = JSON.stringify({ to, subject, htmlBody });
  await context.helpers.serviceBus.send("email-queue", { body: emailBody });
}