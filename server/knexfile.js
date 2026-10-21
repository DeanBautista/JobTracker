require('dotenv').config();

const base = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { min: 0, max: 5 },
  migrations: { directory: './src/db/migrations' },
};

module.exports = {
  development: base,
  production: {
    ...base,
    connection: { ...base.connection, ssl: { rejectUnauthorized: true } },
    pool: { min: 0, max: 2 },
  },
};