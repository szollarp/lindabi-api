import config from "config";
import { format } from "util";
import winston, { createLogger, transports, Logger } from "winston";

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}] ${format(message)}`;
});

const logger = createLogger({
  level: config.get<string>("log.level"),
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  exitOnError: false,
  transports: new transports.Console()
});

export { Logger };

export default logger;
