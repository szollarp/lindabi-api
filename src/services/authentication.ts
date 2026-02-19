import { NotAcceptable, Unauthorized } from "http-errors";
import { createRandomToken } from "../helpers/token";
import { verifyOtpToken } from "../helpers/two-factor";
import { hashPassword } from "../helpers/password";
import * as jwt from "../helpers/jwt";
import { BANNED_MOBILE_ROLES, USER_STATUS } from "../constants";
import { nextDay } from "../helpers/date";
import type {
  ForgottenPasswordRequest,
  ForgottenPasswordResponse,
  Login2FaRequest,
  LoginRequest, LoginResponse, LogoutResponse, RefreshTokenResponse, ResetPasswordRequest,
  ResetPasswordResponse, VerifyAccountRequest, VerifyAccountResponse
} from "../models/interfaces/authentication";
import type { AuthConfig, Context, DecodedUser } from "../types";
import { Op } from "sequelize";

export interface AuthenticationService {
  login: (context: Context, body: LoginRequest, deviceId?: string, headers?: Record<string, string>) => Promise<LoginResponse>
  loginTwoFactor: (context: Context, body: Login2FaRequest, deviceId?: string, headers?: Record<string, string>) => Promise<LoginResponse>
  logout: (context: Context, cookies: Record<string, string>) => Promise<LogoutResponse>
  verifyAccount: (context: Context, body: VerifyAccountRequest, v: string) => Promise<VerifyAccountResponse>
  refreshToken: (context: Context, cookies: Record<string, string>, user: DecodedUser) => Promise<RefreshTokenResponse>
  requestForgottenPassword: (context: Context, body: ForgottenPasswordRequest) => Promise<ForgottenPasswordResponse>
  resetPassword: (context: Context, body: ResetPasswordRequest, v: string) => Promise<ResetPasswordResponse>
}

export const authenticationService = (): AuthenticationService => {
  /**
   * Extract device metadata from request headers
   */
  const extractDeviceMetadata = (headers: Record<string, string>, req?: any) => {
    return {
      platform: headers["x-device-platform"] || null,
      osVersion: headers["x-device-os-version"] || null,
      appVersion: headers["x-app-version"] || null,
      deviceModel: headers["x-device-model"] || null,
      ipAddress: headers["x-forwarded-for"] || headers["x-real-ip"] || (req?.ip) || null,
      lastActivity: new Date()
    };
  };

  const login = async (context: Context, body: LoginRequest, deviceId?: string, headers?: Record<string, string>): Promise<LoginResponse> => {
    const t = await context.models.sequelize.transaction();

    try {
      console.log("Login request body", { body, deviceId });
      if (!deviceId) {
        throw Unauthorized("Authentication failed. Please check your email and password.");
      }

      const user = await context.models.User.findOne({
        attributes: ["id", "password", "salt", "enableTwoFactor", "name"],
        where: {
          email: body.email.toLowerCase(),
          status: USER_STATUS.ACTIVE,
          roleId: {
            [Op.notIn]: body.isMobile ? BANNED_MOBILE_ROLES : []
          }
        },
        include: [{
          model: context.models.Role,
          attributes: ["id", "name"],
          as: "role",
          include: [{
            model: context.models.Permission,
            attributes: ["id", "name"],
            as: "permissions"
          }]
        }]
      });

      if (!user) {
        throw Unauthorized("Authentication failed. Please check your email and password.");
      }

      const hashedPassword = hashPassword(body.password, user.salt);
      if (hashedPassword !== user.password) {
        throw Unauthorized("Authentication failed. Please check your email and password.");
      }

      if (!user.enableTwoFactor) {
        const authConfig: AuthConfig = context.config.get("auth");
        const expirationDays = body.isMobile ? 365 : authConfig.refreshTokenRotation.expirationDays;

        const jwtTokens = await jwt.getJWTTokens(context, {
          id: user.id,
          name: user.name
        }, { refreshTokenExpiresIn: body.isMobile ? '365d' : undefined, accessTokenExpiresIn: body.isMobile ? '365d' : undefined });

        const expiresAt = authConfig.refreshTokenRotation.enabled
          ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
          : null;

        // Extract device metadata from headers
        const deviceMetadata = headers ? extractDeviceMetadata(headers) : {};

        const [refreshToken, created] = await context.models.RefreshToken.findOrCreate({
          where: { userId: user.id, deviceId },
          defaults: {
            token: jwtTokens.refreshToken,
            deviceId,
            expiresAt,
            ...deviceMetadata
          },
          transaction: t
        });

        if (!created) {
          await refreshToken.update({
            token: jwtTokens.refreshToken,
            expiresAt,
            ...deviceMetadata
          }, { transaction: t });
        }

        await user.update({ lastLoggedIn: new Date() }, { transaction: t });
        await t.commit();

        return jwtTokens;
      } else {
        const tokenPayload = `${user.id}+${Date.now()}`;
        const token = createRandomToken(tokenPayload);

        const session = await user.getTwoFactorSession();
        await session?.destroy({ force: true, transaction: t });

        const nextSession = await context.models.TwoFactorSession.create({
          token, userId: user.id
        }, { transaction: t });

        await t.commit();

        return { twoFactorAuthenticationEnabled: true, session: nextSession.token };
      }
    } catch (error: any) {
      await t.rollback();
      context.logger.error("Login error", { error: error.message, type: error.name });
      throw error;
    }
  };

  const loginTwoFactor = async (context: Context, body: Login2FaRequest, deviceId?: string, headers?: Record<string, string>): Promise<LoginResponse> => {
    const t = await context.models.sequelize.transaction();

    try {
      if (!deviceId) {
        throw Unauthorized("Authentication failed. Please check your email and password.");
      }

      const twoFactorSession = await context.models.TwoFactorSession.findOne({
        where: {
          token: body.session
        }
      });

      if (!twoFactorSession) {
        throw Unauthorized("Two-factor authentication token is missing or invalid.");
      }

      const user = await context.models.User.findOne({
        attributes: ["id", "enableTwoFactor", "name"],
        where: {
          id: twoFactorSession.userId
        },
        include: [{
          model: context.models.Role,
          attributes: ["id", "name"],
          as: "role",
          include: [{
            model: context.models.Permission,
            attributes: ["id", "name"],
            as: "permissions"
          }]
        }, {
          model: context.models.TwoFactorAuthentication,
          attributes: ["id", "secret"],
          as: "twoFactorAuthentication"
        }]
      });

      if (!user || !user.enableTwoFactor || !user.twoFactorAuthentication?.secret?.base32) {
        throw Unauthorized("Two-factor authentication verification code is missing or invalid.");
      }

      const isValidOtpToken = verifyOtpToken(user.twoFactorAuthentication.secret.base32, body.token);
      if (!isValidOtpToken) {
        throw Unauthorized("Invalid Verification code. Please try again.");
      }

      await twoFactorSession.destroy({ force: true, transaction: t });

      const authConfig: AuthConfig = context.config.get("auth");
      const isMobile = headers?.["x-device-platform"] === "android" || headers?.["x-device-platform"] === "ios";
      const expirationDays = isMobile ? 365 : authConfig.refreshTokenRotation.expirationDays;

      const jwtTokens = await jwt.getJWTTokens(context, {
        id: user.id,
        name: user.name
      }, { refreshTokenExpiresIn: isMobile ? '365d' : undefined, accessTokenExpiresIn: isMobile ? '365d' : undefined });

      const expiresAt = authConfig.refreshTokenRotation.enabled
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
        : null;
      const deviceMetadata = headers ? extractDeviceMetadata(headers) : {};

      const [refreshToken, created] = await context.models.RefreshToken.findOrCreate({
        where: { userId: user.id, deviceId },
        defaults: {
          token: jwtTokens.refreshToken,
          deviceId,
          expiresAt,
          ...deviceMetadata
        },
        transaction: t
      });

      if (!created) {
        await refreshToken.update({
          token: jwtTokens.refreshToken,
          deviceId, expiresAt,
          ...deviceMetadata
        }, { transaction: t });
      }

      await context.models.User.update({
        lastLoggedIn: new Date()
      }, {
        where: { id: user.id },
        transaction: t
      });

      await t.commit();

      return jwtTokens;
    } catch (error: any) {
      await t.rollback();

      context.logger.error("Two Factor Login error", { error: error.message, type: error.name });
      throw error;
    }
  };

  const verifyAccount = async (context: Context, body: VerifyAccountRequest, token: string): Promise<VerifyAccountResponse> => {
    const t = await context.models.sequelize.transaction();

    try {
      const authConfig: AuthConfig = context.config.get("auth");
      const decoded = jwt.verify(token, authConfig.verifyToken.key) as DecodedUser;
      if (!decoded) {
        throw Unauthorized("The account verification link is invalid or has expired. Please request a new one.");
      }

      const user = await context.models.User.findOne({
        where: { id: decoded.id }
      });

      if (!user) {
        throw Unauthorized("The account verification link is invalid or has expired. Please request a new one.");
      }

      const accountVerifyToken = await context.models.AccountVerifyToken.findOne({
        where: { userId: user.id, token }
      });

      if (!accountVerifyToken) {
        throw Unauthorized("The account verification link is invalid or has expired. Please request a new one.");
      }

      const password = hashPassword(body.password, user.salt);
      await user.update({ password, status: USER_STATUS.ACTIVE }, { transaction: t });

      await accountVerifyToken.destroy({ transaction: t, force: true });
      await t.commit();

      return { success: true };
    } catch (error: any) {
      await t.rollback();

      context.logger.error("Verify Account error", { error: error.message, type: error.name });
      throw error;
    }
  };

  const refreshToken = async (context: Context, headers: Record<string, string>, user: DecodedUser): Promise<RefreshTokenResponse> => {
    try {
      const headerToken = headers["x-refresh-token"];
      const deviceId = headers["x-session-id"];
      const authConfig: AuthConfig = context.config.get("auth");

      try {
        const decoded = jwt.verify(headerToken, authConfig.refreshToken.key, 'lindabi-mobile');
        if (!decoded) {
          console.error("Refresh token jwt.verify returned null/false", { headerToken });
          throw new Error("JWT verification failed");
        }
      } catch (err: any) {
        console.error("Refresh token verification failed", { headerToken, error: err.message });
        throw Unauthorized("Refresh token is invalid or has expired. Please login again.");
      }

      const refreshTokenRecord = await context.models.RefreshToken.findOne({
        attributes: ["token", "id", "expiresAt", "deviceId"],
        where: { token: headerToken },
        include: [{
          model: context.models.User,
          attributes: ["name", "id"],
          as: "user",
          required: true
        }]
      });

      if (!refreshTokenRecord || !refreshTokenRecord.user) {
        console.error("Refresh token not found in DB or user missing", {
          headerTokenPreview: headerToken ? headerToken.substring(0, 10) + '...' : 'null',
          recordFound: !!refreshTokenRecord,
          userFound: !!refreshTokenRecord?.user
        });
        throw Unauthorized("Refresh token is invalid or has expired. Please login again.");
      }

      // Check token expiration if feature is enabled and expiresAt is set
      if (authConfig.refreshTokenRotation.enabled && refreshTokenRecord.expiresAt) {
        if (new Date() > new Date(refreshTokenRecord.expiresAt)) {
          console.error("Refresh token expired", {
            expiresAt: refreshTokenRecord.expiresAt,
            now: new Date()
          });
          await refreshTokenRecord.destroy(); // Clean up expired token
          console.error("Refresh token expired by DB check", { expiresAt: refreshTokenRecord.expiresAt });
          throw Unauthorized("Refresh token has expired. Please login again.");
        }
      }

      const isMobile = headers?.["x-device-platform"] === "android" || headers?.["x-device-platform"] === "ios";

      const { accessToken, refreshToken: newRefreshToken } = await jwt.getJWTTokens(context, refreshTokenRecord.user, {
        refreshTokenExpiresIn: isMobile ? '365d' : undefined,
        accessTokenExpiresIn: isMobile ? '365d' : undefined
      });

      if (authConfig.refreshTokenRotation.enabled) {
        // FEATURE ENABLED: Rotate refresh token (new behavior)
        const isMobile = headers?.["x-device-platform"] === "android" || headers?.["x-device-platform"] === "ios";
        const expirationDays = isMobile ? 365 : authConfig.refreshTokenRotation.expirationDays;
        const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

        await refreshTokenRecord.update({
          token: newRefreshToken,
          expiresAt,
          lastActivity: new Date(),
          updatedOn: new Date()
        });

        context.logger.info("Refresh token rotated", {
          userId: refreshTokenRecord.user.id,
          deviceId: refreshTokenRecord.deviceId,
          expiresAt
        });
      } else {
        // FEATURE DISABLED: Keep old refresh token (backward compatible)
        context.logger.debug("Refresh token rotation disabled, keeping existing token");
        // Return the OLD refresh token (backward compatible)
        return { accessToken, refreshToken: headerToken };
      }

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      console.error(error);
      console.error(error.stack);
      context.logger.error("Refresh Token error", { error: error.message, type: error.name });
      throw error;
    }
  };

  const logout = async (context: Context, headers: Record<string, string>): Promise<LogoutResponse> => {
    try {
      const headerToken = headers["x-refresh-token"];
      await context.models.RefreshToken.destroy({
        where: { token: headerToken }
      });

      return { success: true };
    } catch (error: any) {
      context.logger.error("Logout error", { error: error.message, type: error.name });
      throw Unauthorized("Failed to logout. The session might have already been closed.");
    }
  };

  const requestForgottenPassword = async (context: Context, body: ForgottenPasswordRequest): Promise<ForgottenPasswordResponse> => {
    const t = await context.models.sequelize.transaction();

    try {
      const user = await context.models.User.findOne({
        attributes: ["id", "email", "name"],
        where: { email: body.email.toLowerCase() }
      });

      if (user) {
        const [forgottenPasswordToken, created] = await context.models.ForgottenPasswordToken.findOrCreate({
          where: { userId: user.id },
          defaults: { token: createRandomToken(), expiredOn: nextDay() },
          transaction: t
        });

        if (!created) {
          await forgottenPasswordToken.update({ token: createRandomToken(), expiredOn: nextDay() }, { transaction: t });
        }

        await t.commit();

        context.services.email.sendForgottenPasswordEmail(context, user);
      }

      return { success: true };
    } catch (error: any) {
      await t.rollback();

      context.logger.error("Request Forgotten Password error", { error: error.message, type: error.name, stack: error.stack });
      throw error;
    }
  };

  const resetPassword = async (context: Context, body: ResetPasswordRequest, token: string): Promise<ResetPasswordResponse> => {
    const t = await context.models.sequelize.transaction();

    try {
      const forgottenPasswordToken = await context.models.ForgottenPasswordToken.findOne({
        attributes: ["id"],
        where: { token },
        include: [{
          model: context.models.User,
          attributes: ["id", "salt"],
          as: "user"
        }]
      });

      if (!forgottenPasswordToken?.user?.salt) {
        throw NotAcceptable("The password reset link is invalid or has expired. Please request a new password reset.");
      }

      const newPassword = hashPassword(body.password, forgottenPasswordToken.user.salt);
      await context.models.User.update({ password: newPassword }, {
        where: { id: forgottenPasswordToken.user.id }, transaction: t
      });

      await forgottenPasswordToken.destroy({ force: true, transaction: t });

      await t.commit();
      return { success: true };
    } catch (error: any) {
      await t.rollback();

      context.logger.error("Reset Password error", { error: error.message, type: error.name, stack: error.stack });
      throw error;
    }
  };

  return { login, loginTwoFactor, verifyAccount, refreshToken, logout, requestForgottenPassword, resetPassword };
};
