import React from 'react';
// import { renderToBuffer } from '@react-pdf/renderer';
import type { ServiceBusReceivedMessage } from "@azure/service-bus";
import { WEBSITE_ENDPOINTS } from "../constants";
import getWelcomeNewUserTemplate from "../helpers/email-template/welcome";
import type { SendEmailOptions, SendTemplateEmailOptions } from "../helpers/postmark";
import getPasswordResetTemplate from "../helpers/email-template/password-reset";
import type { Context } from "../types";
import { generatePdfFilename } from "../helpers/tender";
import TenderPDF from '../react/tender-pdf-template';

export type Message = {
  template: string;
  user?: number;
  tender?: number;
  htmlBody?: string;
}

const fetchConfigHostname = (context: Context): string => {
  const { hostname }: { hostname: string } = context.config.get("website");
  return hostname;
};

const handleWelcomeEmail = async (context: Context, userId: number) => {
  const user = await context.models.User.findByPk(userId, {
    attributes: ["id", "email", "name"],
  });

  const hostname = fetchConfigHostname(context);
  const accountToken = await user!.getAccountVerifyToken();
  const href = `${hostname}/${WEBSITE_ENDPOINTS.ACCOUNT_VERIFY}?token=${accountToken.token}`;
  const loginPage = `${hostname}/${WEBSITE_ENDPOINTS.LOGIN}`;
  const htmlBody = getWelcomeNewUserTemplate(user!, href, loginPage);

  const message: SendEmailOptions = { to: user!.email, subject: "Üdvözlő levél", htmlBody };
  await context.helpers.postmark.sendEmail(message);
};

const handleForgottenPasswordEmail = async (context: Context, userId: number) => {
  const user = await context.models.User.findByPk(userId, {
    attributes: ["id", "email", "name"],
  });

  const hostname = fetchConfigHostname(context);
  const forgottenPasswordToken = await user!.getForgottenPasswordToken();
  const href = `${hostname}/${WEBSITE_ENDPOINTS.SET_PASSWORD}?token=${forgottenPasswordToken.token}`;
  const htmlBody = getPasswordResetTemplate(user!, href);

  const message: SendEmailOptions = { to: user!.email, subject: "Jelszó visszaállítási kérelem", htmlBody };
  await context.helpers.postmark.sendEmail(message);
};

const handleSendTender = async (context: Context, tenderId: number, htmlBody: string) => {
  const { renderToBuffer } = await import('@react-pdf/renderer');

  const tender = await context.models.Tender.findOne({
    where: { id: tenderId },
    include: [
      {
        model: context.models.Contact,
        as: "contact",
        attributes: ["name", "email"]
      },
      {
        model: context.models.Location,
        as: "location",
        attributes: ["id", "city", "country", "zipCode", "address"]
      },
      {
        model: context.models.Company,
        as: "customer",
        attributes: ["id", "prefix", "email", "name", "address", "city", "zipCode", "taxNumber", "bankAccount"],
      },
      {
        model: context.models.Company,
        as: "contractor",
        attributes: ["id", "prefix", "email", "name", "address", "city", "zipCode", "taxNumber", "bankAccount"],
        include: [
          {
            model: context.models.Document,
            as: "documents"
          }
        ]
      },
      {
        model: context.models.TenderItem,
        as: "items",
        required: false,
        order: [["num", "ASC"]]
      }
    ],
  });

  const fileName = generatePdfFilename(tender!);
  const element = React.createElement(TenderPDF, { tender });
  const buffer = await renderToBuffer(element);

  const message: SendEmailOptions = {
    to: tender!.contact!.email as string,
    subject: "Új ajánlata megérkezett.",
    htmlBody,
    attachments: [{
      "Name": fileName,
      "Content": buffer.toString("base64"),
      "ContentType": "pdf/application"
    }]
  } as SendEmailOptions;

  await context.helpers.postmark.sendEmail(message);
}

export const handleEmailEvent = async (context: Context, eventMessage: ServiceBusReceivedMessage): Promise<void> => {
  const data: Message = JSON.parse(eventMessage.body.toString() as string);

  switch (data.template) {
    case "welcome":
      await handleWelcomeEmail(context, data.user!);
      break;

    case "forgotten-password":
      await handleForgottenPasswordEmail(context, data.user!);
      break;

    case "send-tender":
      await handleSendTender(context, data.tender!, data.htmlBody!);
      break;

    default:
      context.helpers.postmark.sendEmailWithTemplate(data as SendTemplateEmailOptions);
      break;
  }
};
