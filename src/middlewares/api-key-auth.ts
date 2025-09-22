import { Unauthorized } from "http-errors";
import type { ContextualRequest as Request } from "../types";

export const apiKeyAuth = (req: Request, res: any, next: any) => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    throw new Unauthorized("API key is required");
  }

  // Get the API key from environment variables or config
  const validApiKey = process.env.WEBSITE_API_KEY || "default-website-api-key";

  if (apiKey !== validApiKey) {
    throw new Unauthorized("Invalid API key");
  }

  // Add a dummy user context for website endpoints
  req.user = {
    id: 0,
    name: "Website API",
    permissions: [],
    isManager: false,
    isSystemAdmin: false,
    userType: "user" as any,
    tenant: 1 // Default tenant for website API
  };

  next();
};
