import { type Response, type NextFunction } from "express";
import { ValidateError } from "tsoa";
import type { ContextualRequest as Request } from "../types";

export default (error: Record<string, unknown>, request: Request, response: Response, next: NextFunction): any => {
  if (error instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${request.path}:`, error.fields);
    return response.status(422).json({
      message: "Validation Failed",
      details: error?.fields
    });
  }

  if (error instanceof Error) {
    return response.status(Number(error.status) ?? 500).json({
      message: error.message ?? "Something went wrong!"
    });
  }

  response.status(500).json({
    message: "Something went wrong!"
  });

  next();
};
