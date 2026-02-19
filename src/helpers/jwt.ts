import jwt, { type JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import type { StringValue } from "ms";
import type { User } from "../models/interfaces/user";
import type { Context, AuthConfig } from "../types";

interface GetJwtTokens {
  accessToken: string
  refreshToken: string
};

export const generate = (
  payload: string | Record<string, unknown> | Buffer,
  key: string,
  expiresIn: StringValue | number,
  audience: 'lindabi-mobile' | 'lindabi-web' = 'lindabi-mobile'
): string => {
  // If payload is an object, enhance with standard JWT claims
  if (typeof payload === 'object' && !Buffer.isBuffer(payload)) {
    const enhancedPayload = {
      ...payload,
      iss: 'lindabi-api',                    // Issuer
      aud: audience,                         // Audience
      sub: (payload as any).user?.id || (payload as any).id,  // Subject (user ID)
      jti: uuidv4(),                        // JWT ID (unique)
      iat: Math.floor(Date.now() / 1000)    // Issued at
    };
    return jwt.sign(enhancedPayload, key, { expiresIn, algorithm: "HS512" });
  }

  // Fallback for non-object payloads
  return jwt.sign(payload, key, { expiresIn, algorithm: "HS512" });
};

export const verify = (
  jwtToken: string,
  key: string,
  expectedAudience?: 'lindabi-mobile' | 'lindabi-web'
): JwtPayload | string | null => {
  try {
    const verifiedToken = jwt.verify(jwtToken, key) as JwtPayload;
    if (verifiedToken === null) {
      return null;
    }

    // Validate issuer (if present)
    if (verifiedToken.iss && verifiedToken.iss !== 'lindabi-api') {
      console.error('JWT validation failed: Invalid issuer', { iss: verifiedToken.iss });
      return null;
    }

    // Validate audience (if expected audience is provided)
    if (expectedAudience && verifiedToken.aud && verifiedToken.aud !== expectedAudience) {
      console.error('JWT validation failed: Invalid audience', {
        expected: expectedAudience,
        actual: verifiedToken.aud
      });
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

export const getJWTTokens = async (context: Context, user: { id: number, name: string }, options?: { refreshTokenExpiresIn?: StringValue | number, accessTokenExpiresIn?: StringValue | number }): Promise<GetJwtTokens> => {
  const { refreshToken: refreshTokenConfig, authToken: authTokenConfig }: AuthConfig = context.config.get("auth");

  const refreshTokenExpiration = options?.refreshTokenExpiresIn || refreshTokenConfig.expiresIn;
  const accessTokenExpiration = options?.accessTokenExpiresIn || authTokenConfig.expiresIn;

  const refreshToken = generate({ user }, refreshTokenConfig.key, refreshTokenExpiration);
  const accessToken = generate({ user }, authTokenConfig.key, accessTokenExpiration);

  return { accessToken, refreshToken };
};

export const createAccountVerifyToken = (context: Context, user: User): string => {
  const { verifyToken }: AuthConfig = context.config.get("auth");
  const { expiresIn, key } = verifyToken;

  return jwt.sign({ id: user.id, email: user.email }, key, { expiresIn });
};
