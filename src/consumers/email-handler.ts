import type { ServiceBusReceivedMessage } from "@azure/service-bus";
import type { SendEmailOptions, SendTemplateEmailOptions } from "../helpers/postmark";
import type { Context } from "../types";

export const handleEmailEvent = async (context: Context, eventMessage: ServiceBusReceivedMessage): Promise<void> => {
  const messageOptions: SendEmailOptions | SendTemplateEmailOptions = JSON.parse(eventMessage.body.toString() as string);
  if (messageOptions.hasOwnProperty("template")) {
    await context.helpers.postmark.sendEmailWithTemplate(messageOptions as SendTemplateEmailOptions);
  } else {
    await context.helpers.postmark.sendEmail(messageOptions as SendEmailOptions);
  }
};
