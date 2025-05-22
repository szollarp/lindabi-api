import { type VersionService, versionService } from "./version";
import { type AuthenticationService, authenticationService } from "./authentication";
import { type UserService, userService } from "./user";
import { type RoleService, roleService } from "./role";
import { type TenantService, tenantService } from "./tenant";
import { type CompanyService, companyService } from "./company";
import { type ContactService, contactService } from "./contact";
import { type LocationService, locationService } from "./location";
import { type DocumentService, documentService } from "./document";
import { type TenderService, tenderService } from "./tender";
import { type StatisticsService, statisticsService } from "./statistics";
import { type SearchService, searchService } from "./search";
import { type JourneyService, journeyService } from "./journey";
import { type NotificationService, notificationService } from "./notification"
import { type EmailService, emailService } from "./email"
import { type ProjectService, projectService } from "./project";
import { type StatusReportService, statusReportService } from "./status-report";
import { type ExecutionService, executionService } from "./execution";
import { type OrderFormService, orderFormService } from "./order-form";
import { type CompletionCertificateService, completionCertificateService } from "./completion-certificate";
import { type InvoiceService, invoiceService } from "./invoice";
import { type PayrollService, payrollService } from "./payroll";
import { type FinancialSettingsService, financialSettingsService } from "./financial-settings"
import { type EmployeeScheduleService, employeeScheduleService } from "./employee-schedule";
import { type FinancialTransactionService, financialTransactionService } from "./financial-transaction";
import { type TaskService, taskService } from "./task"
import { type WorkTypeService, workTypeService } from "./work-type";

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
  task: TaskService
  workType: WorkTypeService
}

export default (): Services => ({
  version: versionService(),
  authentication: authenticationService(),
  user: userService(),
  role: roleService(),
  tenant: tenantService(),
  company: companyService(),
  contact: contactService(),
  location: locationService(),
  document: documentService(),
  tender: tenderService(),
  statistics: statisticsService(),
  search: searchService(),
  journey: journeyService(),
  notification: notificationService(),
  email: emailService(),
  project: projectService(),
  statusReport: statusReportService(),
  orderForm: orderFormService(),
  execution: executionService(),
  completionCertificate: completionCertificateService(),
  invoice: invoiceService(),
  payroll: payrollService(),
  financialSettings: financialSettingsService(),
  employeeSchedule: employeeScheduleService(),
  financialTransaction: financialTransactionService(),
  task: taskService(),
  workType: workTypeService()
});
