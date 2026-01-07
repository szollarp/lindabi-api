import { type Response, type NextFunction } from "express";
import HTTPErrors from "http-errors";
import { ValidateError } from "tsoa";
import type { ContextualRequest as Request } from "../types";

const errorMiddleware = (error: Error, request: Request, response: Response, next: NextFunction) => {
  // Check if headers have already been sent
  if (response.headersSent) {
    return next(error);
  }

  if (error instanceof ValidateError) {
    request.context.logger.info(JSON.stringify(error));

    response.statusCode = 422;
    response.json({
      message: "Validation Failed. Please review the provided data and try again.",
      errors: error.fields
    });
    return; // Don't call next() after sending response
  }

  if (error instanceof HTTPErrors.HttpError) {
    response.statusCode = error.statusCode;
    response.json({
      message: error.message
    });
    return; // Don't call next() after sending response
  }

  if (error instanceof Error) {
    response.statusCode = 500;
    response.json({
      message: error.message ?? "Something went wrong!",
    });
    return; // Don't call next() after sending response
  }

  // If we get here, the error wasn't handled, so pass it to the next middleware
  next(error);
};

export default errorMiddleware;