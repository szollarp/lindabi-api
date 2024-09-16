import { Forbidden, Unauthorized } from "http-errors";
import * as jwt from "../helpers/jwt";
import type { User } from "../models/interfaces/user";
import type { Context, DecodedUser, ContextualRequest as Request } from "../types";
import { USER_TYPE } from "../constants";

const getHeaderTokens = (request: Request): { authToken: string, refreshToken: string } => {
  const authToken = request.headers.authorization ?? null;
  if (authToken == null) {
    throw new Unauthorized("Request is not authenticated.");
  }

  const refreshToken = request.cookies["X-Refresh-Token"] || request.headers["x-refresh-token"] || null;
  return { authToken: authToken.replace("Bearer ", ""), refreshToken };
};

const getTenant = (request: Request): number => {
  return Number(request.headers["x-tenant"]);
};

const validateHeaderToken = async (context: Context, authToken: string, refreshToken: string): Promise<{ user: DecodedUser }> => {
  const authConfig: { refreshToken: { key: string }, authToken: { key: string } } = context.config.get("auth");
  const decodedToken = jwt.verify(authToken, authConfig.authToken.key) as { user: DecodedUser };
  if (decodedToken == null) {
    throw new Unauthorized();
  }

  const token = await context.models.RefreshToken.findOne({
    where: { token: refreshToken, userId: decodedToken.user.id }
  });

  if (!token) {
    throw new Unauthorized();
  }

  return {
    user: decodedToken.user
  };
};

const hasPermission = (user: User, permission: string): boolean => {
  return user.role?.permissions?.some(value => value.name === permission) ?? false;
};

const hasSystemAdmin = (user: User): boolean => hasPermission(user, "System:*");

const hasTenantPermission = (user: User, tenantId: number | null): boolean => {
  return hasPermission(user, "System:*") || user.tenantId === tenantId;
};

const hasMePermission = (user: User, permissions: string[], requestPath: string): boolean => {
  const canUseMe = permissions.includes("Me:*");
  if (!canUseMe) return false;

  const { id } = user;
  const usersEndpointRegex = /^\/users\/(\d+)(\/.*)?$/;
  const match = requestPath.match(usersEndpointRegex);
  const requestPathId = Number(match?.[1]) ?? null;
  return id === requestPathId;
};

export const expressAuthentication = async (request: Request, securityName: string, inputPermissions?: string[]): Promise<DecodedUser> => {
  let isSystemAdmin = false;
  let userType = USER_TYPE.USER;

  const { context, path } = request;

  if (securityName !== "jwtToken") {
    throw new Forbidden("Your login credentials have either expired or are no longer valid, please enter your credentials again.");
  }

  const { authToken, refreshToken } = getHeaderTokens(request);
  const decodedToken = await validateHeaderToken(context, authToken, refreshToken);

  if (!decodedToken?.user) {
    throw new Unauthorized();
  }

  const tenant = getTenant(request);
  if (inputPermissions?.includes("Tenant") && !tenant) {
    throw new Forbidden("You do not have permission to access this resource.");
  }

  const permissions = inputPermissions?.filter((permission) => permission !== "Tenant");
  if (permissions !== null && permissions !== undefined && permissions.length > 0) {
    const user = await context.models.User.findOne({
      attributes: ["id", "tenantId", "entity"],
      where: { id: decodedToken.user.id },
      include: [{
        attributes: ["id", "name"],
        model: context.models.Role,
        as: "role",
        include: [{
          attributes: ["id", "name"],
          model: context.models.Permission,
          as: "permissions",
          through: {
            attributes: []
          }
        }]
      }]
    });

    if (!user) {
      throw new Forbidden("You do not have permission to access this resource.");
    }

    const userJson = user.toJSON();
    const shouldUseMePermission = hasMePermission(userJson, permissions, path);
    const shouldUserRequiredPermission = hasPermission(userJson, permissions[0]);
    const shouldUserTenant = hasTenantPermission(user, tenant);
    isSystemAdmin = hasSystemAdmin(userJson);

    if (!isSystemAdmin && !shouldUserRequiredPermission && !shouldUseMePermission && !shouldUserTenant) {
      throw new Forbidden("You do not have permission to access this resource.");
    }

    userType = userJson.entity! as USER_TYPE;
  }

  return await Promise.resolve({
    id: decodedToken.user.id,
    name: decodedToken.user.name,
    permissions,
    isSystemAdmin,
    userType,
    tenant
  });
};
