module.exports = {
  local: {
    username: 'peterszollar',
    password: '0516szollarP',
    database: 'api',
    port: 5432,
    host: 'development-pq.postgres.database.azure.com',
    dialect: 'postgres',
    dialectOptions: {
      encrypt: true,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  development: {
    username: 'root',
    password: null,
    database: 'database_dev',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  production: {
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    username: 'lindabi',
    database: 'lindabi',
    dialect: "postgres",
    ssl: true,
    dialectOptions: {
      encrypt: true,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
};