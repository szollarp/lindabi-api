import { versionService } from "./version";
import { authenticationService } from "./authentication";
import { userService } from "./user";
import { roleService } from "./role";
import { tenantService } from "./tenant";
import { companyService } from "./company";
import { contactService } from "./contact";
import { locationService } from "./location";
import { documentService } from "./document";
import { tenderService } from "./tender";
import { statisticsService } from "./statistics";
import { searchService } from "./search";
import { journeyService } from "./journey";
import { notificationService } from "./notification"
import { emailService } from "./email"
import { projectService } from "./project";
import { statusReportService } from "./status-report";
import { executionService } from "./execution";
import { orderFormService } from "./order-form";
import { completionCertificateService } from "./completion-certificate";
import { invoiceService } from "./invoice";
import { payrollService } from "./payroll";
import { financialSettingsService } from "./financial-settings"
import { employeeScheduleService } from "./employee-schedule";
import { financialTransactionService } from "./financial-transaction";
import type { Services } from "../types";

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
});
