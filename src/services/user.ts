import { Op } from "sequelize";
import { NotAcceptable, Unauthorized } from "http-errors";
import { createRandomToken } from "../helpers/token";
import { USER_STATUS, USER_TYPE } from "../constants";
import type {
  CreateUserProperties, Notifications, UpdatePasswordProperties, User
} from "../models/interfaces/user";
import type { Context } from "../types";
import { createAccountVerifyToken } from "../helpers/jwt";
import { hashPassword } from "../helpers/password";
import { generateQR, generateSecret, verifyOtpToken } from "../helpers/two-factor";
import { Invoice } from "../models/interfaces/invoice";

export interface UserService {
  list: (context: Context, tenantId: number, entity: USER_TYPE, flat?: boolean) => Promise<Array<Partial<User>>>
  get: (context: Context, tenantId: number | null, id: number) => Promise<Partial<User> | null>
  create: (context: Context, tenantId: number, body: CreateUserProperties, createdBy: number) => Promise<Partial<User>>
  update: (context: Context, tenantId: number | null, id: number, body: Partial<User>, updatedBy: number) => Promise<Partial<User>>
  updatePassword: (context: Context, tenantId: number, id: number, body: UpdatePasswordProperties) => Promise<{ success: boolean }>
  updateNotifications: (context: Context, id: number, body: Notifications) => Promise<Notifications | null>
  resendVerificationEmail: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  generateTwoFactorAuthenticationConfig: (context: Context, tenantId: number | null, id: number) => Promise<{ success: boolean, qrCode: string }>
  enableTwoFactorAuthentication: (context: Context, tenantId: number | null, id: number, body: { code: string }) => Promise<{ success: boolean }>
  disableTwoFactorAuthentication: (context: Context, tenantId: number | null, id: number) => Promise<{ success: boolean }>
  deleteUser: (context: Context, tenantId: number, id: number, type: USER_TYPE) => Promise<{ success: boolean }>
  deleteUsers: (context: Context, tenantId: number, body: { ids: number[] }, type: USER_TYPE) => Promise<{ success: boolean }>
  getInvoices: (context: Context, tenantId: number, id: number) => Promise<Invoice[]>
}

const USER_ATTRIBUTES = ["id", "name", "email", "status", "phoneNumber", "country", "region", "city", "address",
  "zipCode", "createdOn", "updatedOn", "lastLoggedIn", "enableTwoFactor", "roleId", "tenantId",
  "notifications", "entity", "employeeType", "notes", "identifier", "birthName", "motherName", "placeOfBirth", "dateOfBirth",
  "socialSecurityNumber", "taxIdentificationNumber", "personalIdentificationNumber", "licensePlateNumber", "enableLogin", "properties", "billing", "inSchedule"];

const USER_ATTRIBUTES_FLAT = ["id", "name", "email", "inSchedule"];

export const userService = (): UserService => {
  const list = async (context: Context, tenantId: number, entity: USER_TYPE = USER_TYPE.USER, flat: boolean = false): Promise<Array<Partial<User>>> => {
    try {
      const where = entity === USER_TYPE.USER ? { tenantId } : { tenantId, entity };
      const attributes = flat ? USER_ATTRIBUTES_FLAT : USER_ATTRIBUTES;
      const include = flat ? [] : [{
        model: context.models.Role,
        attributes: ["id", "name"],
        as: "role"
      }, {
        model: context.models.Contact,
        attributes: ["id", "phoneNumber", "email"],
        as: "contact",
        required: false
      }, {
        model: context.models.Document,
        as: "documents",
        attributes: ["id", "name", "type", "mimeType", "stored"]
      }];

      return await context.models.User.findAll({
        where,
        attributes,
        include,
        order: [["name", "ASC"]]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const create = async (context: Context, tenantId: number, body: CreateUserProperties, createdBy: number): Promise<Partial<User>> => {
    const t = await context.models.sequelize.transaction();

    try {
      const { email, contactId, salaries, ...data } = body;
      const user = await context.models.User.create({
        ...data,
        email: email.toLowerCase(),
        status: USER_STATUS.PENDING,
        salt: createRandomToken(),
        password: "",
        tenantId,
        createdBy
      }, { transaction: t });

      if (contactId) {
        const contact = await context.models.Contact.findByPk(contactId, { transaction: t });
        if (contact) {
          await contact.update({ userId: user.id }, { transaction: t });
        }
      }

      if (salaries) {
        await context.models.Salary.destroy({ where: { userId: user.id }, transaction: t });
        await context.models.Salary.bulkCreate(salaries.map((salary) => ({
          ...salary,
          userId: user.id,
          createdBy
        })), { transaction: t });
      }

      const token = createAccountVerifyToken(context, user);
      await context.models.AccountVerifyToken.create({ token, userId: user.id }, { transaction: t });
      await t.commit();

      context.services.email.sendWelcomeNewUserEmail(context, user);

      return user;
    } catch (error: any) {
      await t.rollback();
      throw error;
    }
  };

  const get = async (context: Context, tenantId: number | null, id: number): Promise<Partial<User | null>> => {
    try {
      const where = !tenantId ? { id } : { id, tenantId };
      return await context.models.User.findOne({
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
        }, {
          model: context.models.Contact,
          attributes: ["id", "phoneNumber", "email"],
          as: "contact",
          required: false
        }, {
          model: context.models.Salary,
          as: "salaries",
          attributes: ["id", "startDate", "endDate", "hourlyRate", "dailyRate"],
          required: false
        }, {
          model: context.models.Contact,
          as: "contact",
          attributes: ["id"],
          required: false
        }, {
          model: context.models.Document,
          as: "documents",
          attributes: ["id", "name", "type", "mimeType", "stored", "properties", "approved"],
        }]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const update = async (context: Context, tenantId: number | null, id: number, body: Partial<User>, updatedBy: number): Promise<Partial<User>> => {
    const t = await context.models.sequelize.transaction();

    try {
      const where = !tenantId ? { id } : { id, tenantId };
      const user = await context.models.User.findOne({
        attributes: USER_ATTRIBUTES,
        include: [{
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
        }, {
          model: context.models.Document,
          as: "documents",
          attributes: ["id", "name", "type", "mimeType", "stored", "properties", "approved"],
        }],
        where
      });

      if (user == null) {
        throw Unauthorized("ERROR_AUTH_FAILED");
      }

      await user.update({ ...body, updatedBy }, { transaction: t });

      if (body.salaries) {
        await context.models.Salary.destroy({ where: { userId: user.id }, transaction: t });
        await context.models.Salary.bulkCreate(body.salaries.map((salary) => ({
          ...salary,
          userId: user.id,
          updatedBy
        })), { transaction: t });
      }

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

      await user?.update({ notifications: body, updatedBy: id });
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

  const deleteUser = async (context: Context, tenantId: number, id: number, entity: USER_TYPE = USER_TYPE.USER): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      await context.models.User.destroy({ where: { id, tenantId, entity, }, transaction: t, cascade: true, force: true });
      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  };

  const deleteUsers = async (context: Context, tenantId: number, body: { ids: number[] }, entity: USER_TYPE = USER_TYPE.USER): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      await context.models.User.destroy({
        where: {
          id: { [Op.in]: body.ids },
          tenantId,
          entity
        }, transaction: t, cascade: true, force: true
      });
      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  };

  const getInvoices = async (context: Context, tenantId: number, id: number): Promise<Invoice[]> => {
    try {
      return await context.models.Invoice.findAll({
        where: { employeeId: id, tenantId },
        attributes: ["id", "invoiceNumber", "type", "netAmount", "vatAmount", "status", "createdOn", "completionDate", "issueDate"],
        include: [{
          model: context.models.Document,
          as: "documents"
        }, {
          model: context.models.Project,
          attributes: ["id", "type", "shortName"],
          as: "project",
          required: true,
          include: [{
            model: context.models.Company,
            as: "contractor",
            attributes: ["id", "name"]
          },
          {
            model: context.models.Location,
            as: "location",
            attributes: ["id", "name"]
          }],
        }, {
          model: context.models.Company,
          as: "supplier",
          attributes: ["id", "name"]
        }, {
          model: context.models.User,
          attributes: ["id", "name"],
          as: "creator"
        }, {
          model: context.models.User,
          attributes: ["id"],
          as: "employee"
        }],
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

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
    updateNotifications,
    getInvoices
  };
};
