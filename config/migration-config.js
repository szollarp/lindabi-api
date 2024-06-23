module.exports = {
  local: {
    username: 'root',
    password: null,
    database: 'database_dev',
    host: '127.0.0.1',
    dialect: 'postgres'
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