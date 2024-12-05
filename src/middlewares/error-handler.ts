import { type Response, type NextFunction } from "express";
import { ValidateError } from "tsoa";
import type { ContextualRequest as Request } from "../types";

const errorMiddleware = (error: Error, request: Request, response: Response, next: NextFunction) => {
  if (error instanceof ValidateError) {
    response.statusCode = 422;
    response.json({
      message: "Validation Failed. Please review the provided data and try again."
    });
  }

  if (error instanceof Error) {
    response.statusCode = 500;
    response.json({
      message: error.message ?? "Something went wrong!",
    });
  }

  next();
};

export default errorMiddleware;