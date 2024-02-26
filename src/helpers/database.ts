import config from "config";
import type { Options } from "sequelize";

export const getDatabaseConfig = (): Options => config.get("database");
