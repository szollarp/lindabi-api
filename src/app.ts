import express, { type Express, type RequestHandler, type ErrorRequestHandler } from "express";
// import multer from "multer";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import cookieParser from "cookie-parser";
import requestLoggerMiddleware from "./middlewares/request-logger";
import notFoundMiddleware from "./middlewares/not-found";
import errorHandlerMiddleware from "./middlewares/error-handler";
import contextMiddleware from "./middlewares/context";
import { RegisterRoutes } from "./routes";
import swaggerDocument from "../docs/swagger.json";
import type { Context, ContextualRequest } from "./types";

export default (context: Context): Express => {
  const app = express();

  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  app.use((req, res, next) => requestLoggerMiddleware(context)(req as ContextualRequest, res, next));
  app.use((req, res, next) => { contextMiddleware(context)(req as ContextualRequest, res, next); });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  RegisterRoutes(app);
  app.use(notFoundMiddleware as RequestHandler);
  app.use(errorHandlerMiddleware as ErrorRequestHandler);

  return app;
};
