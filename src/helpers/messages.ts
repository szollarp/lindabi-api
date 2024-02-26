import { EnvironmentCredential } from "@azure/identity";
import { ServiceBusClient, type ServiceBusMessage, type ServiceBusReceiver, type ServiceBusReceiverOptions } from "@azure/service-bus";
import crypto from "crypto";

export class AzureServiceBus {
  instance: ServiceBusClient;

  constructor(namespace: string) {
    const credential = this.getCredential();
    this.instance = new ServiceBusClient(namespace, credential);
  };

  private getCredential(): EnvironmentCredential {
    return new EnvironmentCredential();
  };

  private readonly createUniqueMessageId = (queueName: string, message: ServiceBusMessage): string => {
    const { body } = message;
    return crypto.createHash("md5").update(queueName + body.message + new Date().toISOString()).digest("hex");
  };

  public createReceiver(queueName: string, options?: ServiceBusReceiverOptions): ServiceBusReceiver {
    return this.instance.createReceiver(queueName, options);
  };

  public async send(queueName: string, message: ServiceBusMessage): Promise<void> {
    const sender = this.instance.createSender(queueName);

    await sender.sendMessages({
      ...message,
      messageId: this.createUniqueMessageId(queueName, message)
    });
  }
};
