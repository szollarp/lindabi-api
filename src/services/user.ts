import { NotAcceptable, Unauthorized } from "http-errors";
import { createRandomToken } from "../helpers/token";
import { USER_STATUS } from "../constants";
import type {
  CreateUserProperties, Notifications, UpdatePasswordProperties,
  UpdateUserProperties, User
} from "../models/interfaces/user";
import type { Context } from "../types";
import { createAccountVerifyToken } from "../helpers/jwt";
import { hashPassword } from "../helpers/password";
import { generateQR, generateSecret, verifyOtpToken } from "../helpers/two-factor";
import { Op } from "sequelize";

export interface UserService {
  list: (context: Context, tenantId: number) => Promise<Array<Partial<User>>>
  get: (context: Context, tenantId: number | null, id: number) => Promise<Partial<User>>
  create: (context: Context, tenantId: number, body: CreateUserProperties) => Promise<Partial<User>>
  update: (context: Context, tenantId: number | null, id: number, body: UpdateUserProperties) => Promise<Partial<User>>
  updatePassword: (context: Context, tenantId: number, id: number, body: UpdatePasswordProperties) => Promise<{ success: boolean }>
  updateNotifications: (context: Context, id: number, body: Notifications) => Promise<Notifications | null>
  resendVerificationEmail: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  generateTwoFactorAuthenticationConfig: (context: Context, tenantId: number | null, id: number) => Promise<{ success: boolean, qrCode: string }>
  enableTwoFactorAuthentication: (context: Context, tenantId: number | null, id: number, body: { code: string }) => Promise<{ success: boolean }>
  disableTwoFactorAuthentication: (context: Context, tenantId: number | null, id: number) => Promise<{ success: boolean }>
  deleteUser: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteUsers: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
}

const USER_ATTRIBUTES = ["id", "name", "email", "status", "phoneNumber", "country", "region", "city", "address",
  "zipCode", "createdOn", "updatedOn", "lastLoggedIn", "enableTwoFactor", "roleId", "tenantId", "notifications"];

export const userService = (): UserService => {
  const list = async (context: Context, tenantId: number): Promise<Array<Partial<User>>> => {
    try {
      const users = await context.models.User.findAll({
        where: { tenantId },
        attributes: USER_ATTRIBUTES,
        order: [["id", "ASC"]],
        include: [{
          model: context.models.Document,
          attributes: ["data", "mimeType"],
          as: "documents",
          foreignKey: "ownerId",
          where: { type: "avatar" },
          required: false
        }, {
          model: context.models.Role,
          attributes: ["id", "name"],
          as: "role"
        }]
      });

      return users;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const create = async (context: Context, tenantId: number, body: CreateUserProperties): Promise<Partial<User>> => {
    const t = await context.models.sequelize.transaction();

    try {
      const { email } = body;

      const user = await context.models.User.create({
        ...body,
        email: email.toLowerCase(),
        status: USER_STATUS.PENDING,
        salt: createRandomToken(),
        password: "",
        tenantId
      }, { transaction: t });

      const token = createAccountVerifyToken(context, user);
      await context.models.AccountVerifyToken.create({ token, userId: user.id }, { transaction: t });
      await t.commit();

      context.services.email.sendWelcomeNewUserEmail(context, user);

      return user;
    } catch (error: any) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  const get = async (context: Context, tenantId: number | null, id: number): Promise<Partial<User>> => {
    try {
      const where = !tenantId ? { id } : { id, tenantId };
      const user = await context.models.User.findOne({
        where,
        attributes: USER_ATTRIBUTES,
        include: [{
          model: context.models.Tenant,
          attributes: ["id", "name"],
          as: "tenant",
          include: [{
            model: context.models.Subscription,
            attributes: ["name", "dateStart", "dateEnd"],
            as: "subscriptions"
          }]
        }, {
          model: context.models.Document,
          attributes: ["data", "mimeType"],
          as: "documents",
          foreignKey: "ownerId"
        }, {
          model: context.models.Role,
          attributes: ["id", "name"],
          as: "role",
          nested: true,
          include: [{
            model: context.models.Permission,
            attributes: ["id", "name"],
            nested: true,
            as: "permissions",
            through: { attributes: [] }
          }]
        }]
      });

      if (user == null) {
        throw Unauthorized("ERROR_AUTH_FAILED");
      }

      return user;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const update = async (context: Context, tenantId: number | null, id: number, body: UpdateUserProperties): Promise<Partial<User>> => {
    const t = await context.models.sequelize.transaction();

    try {
      const where = !tenantId ? { id } : { id, tenantId };
      console.log({ where });
      const user = await context.models.User.findOne({
        attributes: USER_ATTRIBUTES,
        where,
        include: [{
          model: context.models.Document,
          where: { type: "avatar" },
          attributes: ["data", "mimeType"],
          as: "documents",
          required: false
        }]
      });

      if (user == null) {
        throw Unauthorized("ERROR_AUTH_FAILED");
      }

      await user.update(body, { transaction: t });
      await t.commit();

      return user;
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  };

  const updatePassword = async (context: Context, tenantId: number, id: number, body: UpdatePasswordProperties): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      if (body.password === body.newPassword) {
        throw NotAcceptable("ERROR_USER_PASSWORD_SAME");
      }

      const user = await context.models.User.findOne({
        attributes: ["id", "password", "salt"],
        where: { id, tenantId }
      });

      if (user == null || hashPassword(body.password, user.salt) !== user.password) {
        throw Unauthorized("ERROR_AUTH_FAILED");
      }

      const password = hashPassword(body.newPassword, user.salt);
      await user.update({ password }, { transaction: t });
      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  const updateNotifications = async (context: Context, id: number, body: Notifications): Promise<Notifications | null> => {
    try {
      const user = await context.models.User.findOne({
        where: { id }
      });

      await user?.update({ notifications: body });
      return user?.notifications || null;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const resendVerificationEmail = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const user = await context.models.User.findOne({
        attributes: ["id", "email", "name"],
        where: { id, tenantId }
      });

      if (user == null) throw Unauthorized("ERROR_AUTH_FAILED");

      const storedToken = await user.getAccountVerifyToken({
        attributes: ["id", "token"],
        where: {
          userId: user.id
        }
      });

      if (storedToken !== null) {
        await storedToken.destroy({ transaction: t, force: true });
      }

      const token = createAccountVerifyToken(context, user);
      await context.models.AccountVerifyToken.create({ token, userId: user.id }, { transaction: t });
      await t.commit();

      context.services.email.sendWelcomeNewUserEmail(context, user);

      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  const generateTwoFactorAuthenticationConfig = async (context: Context, tenantId: number | null, id: number): Promise<{ success: boolean, qrCode: string }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const where = !tenantId ? { id } : { id, tenantId };
      const user = await context.models.User.findOne({
        attributes: ["id", "enableTwoFactor"],
        include: [{
          model: context.models.TwoFactorAuthentication,
          attributes: ["id", "secret", "userId"],
          as: "twoFactorAuthentication"
        }],
        where
      });

      if (user == null) {
        throw Unauthorized("ERROR_AUTH_FAILED");
      }

      const secret = generateSecret();
      const qrCode = await generateQR(secret.otpauth_url!);
      const [twoFactorAuthentication, created] = await context.models.TwoFactorAuthentication.findOrCreate({
        where: { userId: user.id },
        defaults: { secret, userId: user.id },
        transaction: t
      });

      if (!created) {
        await twoFactorAuthentication.update({ secret }, { transaction: t });
      }

      await t.commit();

      return { success: true, qrCode };
    } catch (error: any) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  const enableTwoFactorAuthentication = async (context: Context, tenantId: number | null, id: number, body: { code: string }): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const where = !tenantId ? { id } : { id, tenantId };
      const user = await context.models.User.findOne({
        attributes: ["id", "enableTwoFactor"],
        include: [{
          model: context.models.TwoFactorAuthentication,
          attributes: ["id", "secret", "userId"],
          as: "twoFactorAuthentication"
        }],
        where
      });

      if (!user?.twoFactorAuthentication?.secret?.base32) {
        throw Unauthorized("ERROR_AUTH_FAILED");
      }

      const good = verifyOtpToken(user.twoFactorAuthentication.secret.base32, body.code);
      if (!good) {
        throw Unauthorized("ERROR_AUTH_FAILED");
      }

      await user.update({ enableTwoFactor: true }, { transaction: t });
      await t.commit();

      return { success: true };
    } catch (error: any) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  const disableTwoFactorAuthentication = async (context: Context, tenantId: number | null, id: number): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const where = !tenantId ? { id } : { id, tenantId };
      const user = await context.models.User.findOne({
        attributes: ["id", "enableTwoFactor"],
        where
      });

      if (!user) {
        throw Unauthorized("ERROR_AUTH_FAILED");
      }

      await context.models.TwoFactorAuthentication.destroy({ where: { userId: user.id }, transaction: t });
      await user.update({ enableTwoFactor: false }, { transaction: t });
      await t.commit();

      return { success: true };
    } catch (error: any) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  };

  const deleteUser = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      await context.models.User.destroy({ where: { id, tenantId }, transaction: t, cascade: true, force: true });
      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  };

  const deleteUsers = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      await context.models.User.destroy({ where: { id: { [Op.in]: body.ids }, tenantId }, transaction: t, cascade: true, force: true });
      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  };

  return {
    list,
    create,
    get,
    update,
    resendVerificationEmail,
    updatePassword,
    enableTwoFactorAuthentication,
    generateTwoFactorAuthenticationConfig,
    disableTwoFactorAuthentication,
    deleteUser,
    deleteUsers,
    updateNotifications
  };
};
