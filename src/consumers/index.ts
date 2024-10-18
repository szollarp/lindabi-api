import { handleEmailEvent } from "./email-handler";
import type { Context } from "../types";

const handleError = (context: Context, args: any): void => {
  context.logger.warn(
    `Error occurred with ${args.entityPath} within ${args.fullyQualifiedNamespace}: `,
    args.error
  );
};

const initEmailConsumer = async (context: Context): Promise<void> => {
  context.logger.info("Initializing email consumer.");
  const receiver = context.helpers.serviceBus.createReceiver("email-queue");
  receiver.subscribe({
    processMessage: async (message) => { await handleEmailEvent(context, message); },
    processError: async (args) => { handleError(context, args); }
  });
};

export const initConsumers = async (context: Context): Promise<void> => {
  await initEmailConsumer(context);
};