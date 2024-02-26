import { ServerClient as PostmarkServerClient, type TemplatedMessage } from "postmark";
import type { Logger } from "winston";

export interface SendEmailOptions {
  to: string
  template: string
  variables: Record<string, unknown>
};

export class PostmarkService {
  instance: PostmarkServerClient;

  logger: Logger;

  emailFrom: string;

  constructor(serverToken: string, emailFrom: string, logger: Logger) {
    this.instance = new PostmarkServerClient(serverToken);
    this.logger = logger;
    this.emailFrom = emailFrom;
  };

  public async sendEmailWithTemplate(options: SendEmailOptions, trackOpens: boolean = true): Promise<void> {
    const { template, variables, to } = options;

    try {
      const message: TemplatedMessage = {
        TemplateAlias: template,
        TemplateModel: variables,
        From: this.emailFrom,
        To: to,
        TrackOpens: trackOpens
      };

      await this.instance.sendEmailWithTemplate(message);
      this.logger.info(`Message is sending to ${to} with template: ${template}`);
    } catch (error: any) {
      this.logger.error(`Postmark: ${error.message as string}`);
    }
  }
};
