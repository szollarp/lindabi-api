import { randomBytes } from "node:crypto";

export const createRandomToken = (payload: string = ""): string => {
  const randomString = randomBytes(48).toString("hex");
  const payloadPart = Buffer.from(JSON.stringify(payload)).toString("hex");
  return `${randomString}${payloadPart}`;
};
