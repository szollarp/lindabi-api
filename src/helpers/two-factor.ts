import config from "config";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";

export const generateSecret = (): speakeasy.GeneratedSecret => speakeasy.generateSecret({
  name: config.get("applicationName")
});

export const generateQR = async (text: string): Promise<string> => await QRCode.toDataURL(text);

export const verifyOtpToken = (secret: string, token: string): boolean => speakeasy.totp.verify({
  secret,
  encoding: "base32",
  token
});
