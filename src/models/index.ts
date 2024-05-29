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
import { ImageFactory, type ImageModel } from "./image";
import { TenderFactory, type TenderModel } from "./tender";
import { TenderItemFactory, type TenderItemModel } from "./tender-item";

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
  Image: typeof ImageModel
  Tender: typeof TenderModel
  TenderItem: typeof TenderItemModel
};

export const createModels = async (databaseConfig: Options, benchmark: boolean = false, logging: boolean = false): Promise<Models> => {
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
    Image: ImageFactory(sequelize),
    Tender: TenderFactory(sequelize),
    TenderItem: TenderItemFactory(sequelize),
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
