import type { ServiceBusReceivedMessage } from "@azure/service-bus";
import type { SendEmailOptions } from "../helpers/postmark";
import type { Context } from "../types";

export const handleEmailEvent = async (context: Context, eventMessage: ServiceBusReceivedMessage): Promise<void> => {
  const messageOptions = JSON.parse(eventMessage.body.toString() as string);
  await context.helpers.postmark.sendEmailWithTemplate(messageOptions as SendEmailOptions);
};
