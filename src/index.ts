import * as dotenv from "dotenv";
import logger from "./helpers/logger";
import { create as createContext } from "./context";
import { runServer } from "./server";
import { initConsumers } from "./consumers";

dotenv.config();

createContext()
  .then(runServer)
  .then(initConsumers)
  .catch((error) => {
    logger.error(error.stack);
    logger.info("------------ EXIT ------------");
    process.exit(1);
  });

process.on("unhandledRejection", (reason: { stack?: string } | null | undefined, promise: Promise<any>) => {
  logger.error(reason);
  logger.error("Unhandled Rejection at:", reason?.stack ?? reason, "Promise: ", promise);
});

process.on("uncaughtException", (error: Error) => {
  logger.error(error);
  logger.error("Uncaught exception: ", error);
  logger.error("Uncaught exception stack: ", error.stack);
  process.exit(1);
});
