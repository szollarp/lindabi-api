"use strict";

require('dotenv').config();
const { getDatabaseConfig } = require("../lib/helpers/database");

// used by sequelize-cli
module.exports = getDatabaseConfig