import type { StringValue } from "ms";
import { USER_TYPE } from "./constants";
import { type IConfig } from "config";
import { type Request } from "express";
import { type Logger } from "./helpers/logger";
import { type AzureServiceBus } from "./helpers/messages";
import { type PostmarkService } from "./helpers/postmark";
import { type Models } from "./models";
import { AzureStorageService } from "./helpers/azure-storage";
import { Services } from "./services";

export interface Helpers {
  serviceBus: AzureServiceBus
  postmark: PostmarkService
}

export interface Context {
  logger: Logger
  config: IConfig
  models: Models
  services: Services
  helpers: Helpers
  env: string
  storage: AzureStorageService
}

export type ContextualRequest = Request & {
  context: Context
  cookies: Record<string, string>
  user: DecodedUser
};

export interface DecodedUser {
  id: number
  name: string
  tenant: number
  isManager: boolean
  isSystemAdmin: boolean
  userType: USER_TYPE.EMPLOYEE | USER_TYPE.USER
  permissions?: string[]
};

export interface AuthConfig {
  cryptoKey: string
  authToken: { key: string, expiresIn: StringValue }
  refreshToken: { key: string, expiresIn: StringValue }
  verifyToken: { key: string, expiresIn: StringValue }
};
