module.exports = {
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