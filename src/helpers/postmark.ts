import { ServerClient as PostmarkServerClient, type TemplatedMessage, type Message, Attachment } from "postmark";
import config from "config";
import renderHtmlTemplate from "../assets/email-layout";

import type { Logger } from "winston";

export interface EmailOptions {
  to: string;
  attachments?: Attachment[];
};

export interface SendTemplateEmailOptions extends EmailOptions {
  template: string
  variables: Record<string, unknown>
};

export interface SendEmailOptions extends EmailOptions {
  htmlBody: string;
  subject: string;
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

  public async sendEmailWithTemplate(options: SendTemplateEmailOptions, trackOpens: boolean = true): Promise<void> {
    const { template, variables, to } = options;

    try {
      const message: TemplatedMessage = {
        TemplateAlias: template,
        TemplateModel: variables,
        From: this.emailFrom,
        To: to,
        TrackOpens: trackOpens,
      };

      await this.instance.sendEmailWithTemplate(message);
      this.logger.info(`Message is sending to ${to} with template: ${template}`);
    } catch (error: any) {
      this.logger.error(`Postmark: ${error.message as string}`);
    }
  }

  public async sendEmail(options: SendEmailOptions, trackOpens: boolean = true): Promise<void> {
    const applicationName: string = config.get("applicationName");
    const { htmlBody, subject, to } = options;

    try {
      const message: Message = {
        HtmlBody: renderHtmlTemplate(htmlBody, applicationName),
        From: this.emailFrom,
        To: to,
        TrackOpens: trackOpens,
        Subject: subject
      };

      if (options.attachments) {
        message.Attachments = options.attachments;
      }

      await this.instance.sendEmail(message);
      this.logger.info(`Message is sending to ${to}`);
    } catch (error: any) {
      this.logger.error(`Postmark: ${error.message as string}`);
    }
  }
};
