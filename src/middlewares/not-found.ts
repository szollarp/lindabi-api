import { type Response, type NextFunction } from "express";
import type { ContextualRequest as Request } from "../types";

export default (request: Request, response: Response, next: NextFunction): void => {
  response.statusCode = 405;
  response.json({
    message: "Method Not Allowed"
  });

  next();
};
