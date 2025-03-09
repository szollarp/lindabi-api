import type { StringValue } from "ms";
import { USER_TYPE } from "./constants";
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
import { type StatusReportService } from "./services/status-report";
import { type ExecutionService } from "./services/execution";
import { type OrderFormService } from "./services/order-form";
import { type CompletionCertificateService } from "./services/completion-certificate";
import { type InvoiceService } from "./services/invoice";
import { type PayrollService } from "./services/payroll";
import { type FinancialSettingsService } from "./services/financial-settings";
import { type EmployeeScheduleService } from "./services/employee-schedule";
import { type FinancialTransactionService } from "./services/financial-transaction";
import { type Models } from "./models";

export interface Services {
  version: VersionService
  authentication: AuthenticationService
  document: DocumentService
  orderForm: OrderFormService
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
  statusReport: StatusReportService
  execution: ExecutionService
  completionCertificate: CompletionCertificateService
  invoice: InvoiceService
  payroll: PayrollService
  financialSettings: FinancialSettingsService
  employeeSchedule: EmployeeScheduleService
  financialTransaction: FinancialTransactionService
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
