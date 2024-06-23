const { resolve } = require("path");

module.exports = {
  config: resolve("config", "migration-config.js"),
  "migrations-path": resolve("migrations"),
  "seeders-path": resolve("seeders"),
};