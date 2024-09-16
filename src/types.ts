import { type IConfig } from "config";
import { type Request } from "express";
import { type Logger } from "./helpers/logger";
import { type VersionService } from "./services/version";
import { type AuthenticationService } from "./services/authentication";
import { type UserService } from "./services/user";
import { type RoleService } from "./services/role";
import { type TenantService } from "./services/tenant";
import { type DocumentService } from "./services/document";
import { type CompanyService } from "./services/company";
import { type ContactService } from "./services/contact";
import { type LocationService } from "./services/location";
import { type AzureServiceBus } from "./helpers/messages";
import { type PostmarkService } from "./helpers/postmark";
import { type TenderService } from "./services/tender";
import { type StatisticsService } from "./services/statistics";
import { type SearchService } from "./services/search";
import { type JourneyService } from "./services/journey";
import { type NotificationService } from "./services/notification";
import { type EmailService } from "./services/email";
import { type ProjectService } from "./services/project";
import { type Models } from "./models";
import { USER_TYPE } from "./constants";

export interface Services {
  version: VersionService
  authentication: AuthenticationService
  document: DocumentService
  user: UserService
  role: RoleService
  tenant: TenantService
  company: CompanyService
  contact: ContactService
  location: LocationService
  tender: TenderService
  statistics: StatisticsService
  search: SearchService
  journey: JourneyService
  notification: NotificationService
  email: EmailService
  project: ProjectService
}

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
  isSystemAdmin: boolean
  userType: USER_TYPE.EMPLOYEE | USER_TYPE.USER
  permissions?: string[]
};

export interface AuthConfig {
  cryptoKey: string
  authToken: { key: string, expiresIn: string }
  refreshToken: { key: string, expiresIn: string }
  verifyToken: { key: string, expiresIn: string }
};
