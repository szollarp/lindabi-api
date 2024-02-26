import crypto from "crypto";

export const generateSalt = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashPassword = (password: string, userSalt: string): string => {
  return crypto.pbkdf2Sync(password, userSalt, 1000, 64, "sha512").toString("hex");
};
