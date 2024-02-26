import morgan from "morgan";
import { type IncomingMessage } from "http";
import { hostname } from "os";
import { type ContextualRequest as Request, type Context } from "../types";

const IGNORED_PATH = [
  "/health",
  "/api-docs"
];

type LoggerRequest = {
  instanceId?: string
  body?: Record<string, unknown>
} & IncomingMessage;

morgan.token("instance-id", (request: LoggerRequest) => request.instanceId);
morgan.token("hostname", () => hostname());
morgan.token("pid", () => process.pid.toString());
morgan.token("body", (request: LoggerRequest) => JSON.stringify(request.body ?? {}));

const setLoggerFormat = (context: Context): string => {
  const isDevelopment = context.env === "development";
  if (isDevelopment) return "dev";

  return (
    JSON.stringify({
      "remote-address": ":remote-addr",
      time: ":date[iso]",
      method: ":method",
      url: ":url",
      "http-version": ":http-version",
      "status-code": ":status",
      "content-length": ":res[content-length]",
      "response-time": ":response-time",
      referrer: ":referrer",
      "user-agent": ":user-agent",
      hostname: ":hostname",
      pid: ":pid",
      "instance-id": ":instance-id",
      body: ":body"
    })
  );
};

export default (context: Context): any => {
  return morgan(setLoggerFormat(context), {
    skip: (request: Request): boolean => IGNORED_PATH.some((path) => request.originalUrl.includes(path)),
    stream: { write: (message) => context.logger.info(message.substring(0, message.lastIndexOf("\n"))) }
  });
};
