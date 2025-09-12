import * as dotenv from "dotenv";
import logger from "./helpers/logger";
import { create as createContext } from "./context";
import { runServer } from "./server";
import { initConsumers } from "./consumers";

dotenv.config();

createContext()
  .then((context) => {
    context.services.scheduler.start(context);
    return context;
  })
  .then(runServer)
  .then(initConsumers)
  .catch((error) => {
    logger.error(error.stack);
    logger.info("------------ EXIT ------------");
  });

process.on("unhandledRejection", (reason: { stack?: string } | null | undefined, promise: Promise<any>) => {
  logger.error("Unhandled Rejection at:", reason?.stack ?? reason, "Promise: ", promise);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught exception: ", error);
  logger.error("Uncaught exception stack: ", error.stack);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});