import { type Response, type NextFunction } from "express";
import type { ContextualRequest as Request } from "../types";

const notFoundMiddleware = (request: Request, response: Response, next: NextFunction) => {
  response.statusCode = 405;
  response.json({
    message: "Method Not Allowed"
  });

  next();
};

export default notFoundMiddleware;