import initApp from "./app";
import { type Context } from "./types";

export const runServer = async (context: Context): Promise<Context> => {
  const { host, port }: { host: string, port: number } = context.config.get("server");
  const env: string = context.config.get("env");
  const app = initApp(context);

  app.listen(port, host, () => {
    context.logger.info(`App listening at http://${host}:${port}`);
    context.logger.info(`NODE_ENV: ${env}`);
  });

  return context;
};
