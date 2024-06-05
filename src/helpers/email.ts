import { WEBSITE_ENDPOINTS } from "../constants";
import type { UserModel } from "../models/user";
import type { Context } from "../types";

export const sendForgottenPasswordEmail = async (context: Context, user: UserModel): Promise<void> => {
  const { hostname }: { hostname: string } = context.config.get("website");
  const applicationName = context.config.get("applicationName");
  const company: { name: string, address: string } = context.config.get("company");

  const { email, name } = user;
  const forgottenPasswordToken = await user.getForgottenPasswordToken();
  const actionUrl = `${hostname}/${WEBSITE_ENDPOINTS.SET_PASSWORD}?token=${forgottenPasswordToken.token}`;

  const message = JSON.stringify({
    to: email,
    variables: {
      name,
      product_url: hostname,
      product_name: applicationName,
      action_url: actionUrl,
      company_name: company.name,
      company_address: company.address
    },
    template: "password-reset"
  });

  await context.helpers.serviceBus.send("email-queue", { body: message });
};

export const sendRegistrationEmail = async (context: Context, user: UserModel): Promise<void> => {
  const { hostname }: { hostname: string } = context.config.get("website");
  const company: { name: string, address: string } = context.config.get("company");
  const applicationName = context.config.get("applicationName");

  const { email, name } = user;
  const accountToken = await user.getAccountVerifyToken();

  const actionUrl = `${hostname}/${WEBSITE_ENDPOINTS.ACCOUNT_VERIFY}?token=${accountToken.token}`;
  const loginUrl = `${hostname}/${WEBSITE_ENDPOINTS.LOGIN}`;

  const message = JSON.stringify({
    to: email,
    variables: {
      name,
      email,
      action_url: actionUrl,
      product_url: hostname,
      product_name: applicationName,
      login_url: loginUrl,
      company_name: company.name,
      company_address: company.address
    },
    template: "welcome"
  });

  await context.helpers.serviceBus.send("email-queue", { body: message });
};