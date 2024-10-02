import config from "config";
import { type Options } from "sequelize";
import createServices from "./services";
import logger from "./helpers/logger";
import { AzureServiceBus } from "./helpers/messages";
import { PostmarkService } from "./helpers/postmark";
import { getDatabaseConfig } from "./helpers/database";
import { createModels } from "./models";
import type { Context } from "./types";
import { AzureStorageService } from "./helpers/azure-storage";

export const create = async (): Promise<Context> => {
  const env: string = config.get("env") ?? "development";
  const isProduction: boolean = env === "production";

  const databaseConfig: Options = getDatabaseConfig();
  const services = createServices();

  const storage = new AzureStorageService(config.get("azure.storage"));

  const models = await createModels(databaseConfig, !isProduction, !isProduction, storage);
  await models.sequelize.authenticate();

  const serviceBus = new AzureServiceBus(config.get("serviceBus.namespace"));

  const { token, from }: { token: string, from: string } = config.get("postmark");
  const postmark = new PostmarkService(token, from, logger);

  const helpers = { serviceBus, postmark };

  const context: Context = {
    config,
    logger,
    services,
    helpers,
    models,
    env
  };

  return context;
};
