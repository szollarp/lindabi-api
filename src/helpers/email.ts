import { WEBSITE_ENDPOINTS } from "../constants";
import type { UserModel } from "../models/user";
import type { Context } from "../types";

export const sendForgottenPasswordEmail = async (context: Context, user: UserModel): Promise<void> => {
  const { email, name } = user;
  const forgottenPasswordToken = await user.getForgottenPasswordToken();

  const message = JSON.stringify({
    to: email,
    variables: { action_url: forgottenPasswordToken, name, product_name: context.config.get("applicationName") },
    template: "password-reset"
  });

  await context.helpers.serviceBus.send("email-queue", { body: message });
};

export const sendRegistrationEmail = async (context: Context, user: UserModel): Promise<void> => {
  const { email, name } = user;
  const accountToken = await user.getAccountVerifyToken();
  const { hostname }: { hostname: string } = context.config.get("website");
  const actionUrl = `${hostname}/${WEBSITE_ENDPOINTS.ACCOUNT_VERIFY}?token=${accountToken.token}`;

  const message = JSON.stringify({
    to: email,
    variables: { name, actionUrl },
    template: "welcome"
  });

  await context.helpers.serviceBus.send("email-queue", { body: message });
};
