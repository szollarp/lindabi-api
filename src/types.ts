import { type IConfig } from "config";
import { type Request } from "express";
import { type Logger } from "./helpers/logger";
import { type VersionService } from "./services/version";
import { type AuthenticationService } from "./services/authentication";
import { type UserService } from "./services/user";
import { type RoleService } from "./services/role";
import { type TenantService } from "./services/tenant";
import { type ProfilePictureService } from "./services/profile-picture";
import { type CompanyService } from "./services/company";
import { type ContactService } from "./services/contact";
import { type LocationService } from "./services/location";
import { type AzureServiceBus } from "./helpers/messages";
import { type PostmarkService } from "./helpers/postmark";
import { type Models } from "./models";

export interface Services {
  version: VersionService
  authentication: AuthenticationService
  profilePicture: ProfilePictureService
  user: UserService
  role: RoleService
  tenant: TenantService
  company: CompanyService
  contact: ContactService
  location: LocationService
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
  tenant: number
  isSystemAdmin: boolean
};

export interface AuthConfig {
  cryptoKey: string
  authToken: { key: string, expiresIn: string }
  refreshToken: { key: string, expiresIn: string }
  verifyToken: { key: string, expiresIn: string }
};
