import { Sequelize, type Options } from "sequelize";
import { UserFactory, type UserModel } from "./user";
import { RoleFactory, type RoleModel } from "./role";
import { PermissionFactory, type PermissionModel } from "./permission";
import { AccountVerifyTokenFactory, type AccountVerifyTokenModel } from "./account-verify-token";
import { ForgottenPasswordTokenFactory, type ForgottenPasswordTokenModel } from "./forgotten-password-token";
import { RefreshTokenFactory, type RefreshTokenModel } from "./refresh-token";
import { TwoFactorSessionModelFactory, type TwoFactorSessionModel } from "./two-factor-session";
import { TwoFactorAuthenticationModelFactory, type TwoFactorAuthenticationModel } from "./two-factor-authentication";
import { TenantFactory, type TenantModel } from "./tenant";
import { SubscriptionFactory, type SubscriptionModel } from "./subscription";
import { ContactFactory, type ContactModel } from "./contact";
import { CompanyFactory, type CompanyModel } from "./company";
import { LocationFactory, type LocationModel } from "./location";
import { DocumentFactory, type DocumentModel } from "./document";
import { TenderFactory, type TenderModel } from "./tender";
import { TenderItemFactory, type TenderItemModel } from "./tender-item";
import { JourneyFactory, type JourneyModel } from "./journey";
import { SalaryFactory, type SalaryModel } from "./salary";
import { ProjectFactory, type ProjectModel } from "./project";
import { ProjectItemFactory, type ProjectItemModel } from "./project-item";
import { MilestoneFactory, type MilestoneModel } from "./milestone";
import { ProjectContactFactory, type ProjectContactModel } from "./project-contact";
import { ProjectSupervisorFactory, ProjectSupervisorModel } from "./project-supervisor";
import { ProjectCommentFactory, ProjectCommentModel } from "./project-comment";
import { StatusReportFactory, StatusReportModel } from "./status-report";
import { ExecutionModel, ExecutionFactory } from "./execution";
import { CompletionCertificateFactory, type CompletionCertificateModel } from "./completion-certificate";
import { OrderFormFactory, type OrderFormModel } from "./order-form";
import { InvoiceFactory, type InvoiceModel } from "./invoice";
import { AzureStorageService } from "../helpers/azure-storage";

export interface Models {
  sequelize: Sequelize
  User: typeof UserModel
  Role: typeof RoleModel
  Permission: typeof PermissionModel
  AccountVerifyToken: typeof AccountVerifyTokenModel
  ForgottenPasswordToken: typeof ForgottenPasswordTokenModel
  RefreshToken: typeof RefreshTokenModel
  TwoFactorSession: typeof TwoFactorSessionModel
  TwoFactorAuthentication: typeof TwoFactorAuthenticationModel
  Tenant: typeof TenantModel
  Subscription: typeof SubscriptionModel
  Contact: typeof ContactModel
  Company: typeof CompanyModel
  Location: typeof LocationModel
  Document: typeof DocumentModel
  Tender: typeof TenderModel
  TenderItem: typeof TenderItemModel
  Journey: typeof JourneyModel
  Salary: typeof SalaryModel
  Project: typeof ProjectModel
  ProjectItem: typeof ProjectItemModel
  ProjectContact: typeof ProjectContactModel
  ProjectSupervisor: typeof ProjectSupervisorModel
  Milestone: typeof MilestoneModel
  ProjectComment: typeof ProjectCommentModel
  StatusReport: typeof StatusReportModel
  Execution: typeof ExecutionModel
  CompletionCertificate: typeof CompletionCertificateModel
  OrderForm: typeof OrderFormModel
  Invoice: typeof InvoiceModel
};

export const createModels = async (databaseConfig: Options, benchmark: boolean = false, logging: boolean = false, storage: AzureStorageService): Promise<Models> => {
  const sequelize = new Sequelize({ benchmark, logging, ...databaseConfig });

  const models: Models = {
    User: UserFactory(sequelize),
    Role: RoleFactory(sequelize),
    Permission: PermissionFactory(sequelize),
    AccountVerifyToken: AccountVerifyTokenFactory(sequelize),
    ForgottenPasswordToken: ForgottenPasswordTokenFactory(sequelize),
    RefreshToken: RefreshTokenFactory(sequelize),
    TwoFactorSession: TwoFactorSessionModelFactory(sequelize),
    TwoFactorAuthentication: TwoFactorAuthenticationModelFactory(sequelize),
    Tenant: TenantFactory(sequelize),
    Subscription: SubscriptionFactory(sequelize),
    Contact: ContactFactory(sequelize),
    Company: CompanyFactory(sequelize),
    Location: LocationFactory(sequelize),
    Document: DocumentFactory(sequelize, storage),
    Tender: TenderFactory(sequelize),
    TenderItem: TenderItemFactory(sequelize),
    Journey: JourneyFactory(sequelize),
    Salary: SalaryFactory(sequelize),
    Project: ProjectFactory(sequelize),
    ProjectItem: ProjectItemFactory(sequelize),
    ProjectContact: ProjectContactFactory(sequelize),
    ProjectSupervisor: ProjectSupervisorFactory(sequelize),
    Milestone: MilestoneFactory(sequelize),
    ProjectComment: ProjectCommentFactory(sequelize),
    StatusReport: StatusReportFactory(sequelize),
    Execution: ExecutionFactory(sequelize),
    CompletionCertificate: CompletionCertificateFactory(sequelize),
    OrderForm: OrderFormFactory(sequelize),
    Invoice: InvoiceFactory(sequelize),
    sequelize
  };

  for (const modelName of Object.keys(models)) {
    const model = models[modelName as keyof Models] as any as { associate?: (models: Models) => void };
    if (model.associate !== undefined) {
      model.associate(models);
    }
  }

  return models;
};
