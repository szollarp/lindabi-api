import jwt, { type JwtPayload } from "jsonwebtoken";
import type { StringValue } from "ms";
import type { User } from "../models/interfaces/user";
import type { Context, AuthConfig } from "../types";

interface GetJwtTokens {
  accessToken: string
  refreshToken: string
};

export const generate = (payload: string | Record<string, unknown> | Buffer, key: string, expiresIn: StringValue | number): string => {
  return jwt.sign(payload, key, { expiresIn, algorithm: "HS512" });
};

export const verify = (jwtToken: string, key: string): JwtPayload | string | null => {
  try {
    const verifiedToken = jwt.verify(jwtToken, key);
    if (verifiedToken === null) {
      return null;
    }

    return verifiedToken;
  } catch (err) {
    return null;
  }
};

export const pickUserData = (user: User): Partial<User> => {
  const { id, name, country, region, city, email, enableTwoFactor, phoneNumber, status, address, zipCode } = user;
  return { id, name, country, region, city, email, enableTwoFactor, phoneNumber, status, address, zipCode };
};

export const getJWTTokens = async (context: Context, user: { id: number, name: string }): Promise<GetJwtTokens> => {
  const { refreshToken: refreshTokenConfig, authToken: authTokenConfig }: AuthConfig = context.config.get("auth");

  const refreshToken = generate({ user }, refreshTokenConfig.key, refreshTokenConfig.expiresIn);
  const accessToken = generate({ user }, authTokenConfig.key, authTokenConfig.expiresIn);

  return { accessToken, refreshToken };
};

export const createAccountVerifyToken = (context: Context, user: User): string => {
  const { verifyToken }: AuthConfig = context.config.get("auth");
  const { expiresIn, key } = verifyToken;

  return jwt.sign({ id: user.id, email: user.email }, key, { expiresIn });
};
