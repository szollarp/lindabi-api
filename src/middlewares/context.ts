import { type NextFunction, type Response } from "express";
import type { Context, ContextualRequest as Request } from "../types";

export default (context: Context) => (request: Request, res: Response, next: NextFunction): void => {
  request.context = context;
  next();
};
