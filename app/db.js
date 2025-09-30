import pg from 'pg';
const { Pool } = pg;


const config = {
host: process.env.DB_HOST, // e.g. db-internal.genie-software.com
port: parseInt(process.env.DB_PORT || '5432', 10),
user: process.env.DB_USER, // e.g. genieapp
password: process.env.DB_PASSWORD, // from env or Secrets Manager
database: process.env.DB_NAME, // e.g. geniedb
ssl: process.env.DB_SSL === 'require' ? { rejectUnauthorized: false } : false
};


export const pool = new Pool(config);


export async function migrate(client) {
await client.query(`
CREATE TABLE IF NOT EXISTS app.todos (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
done BOOLEAN NOT NULL DEFAULT false,
created_at timestamptz NOT NULL DEFAULT now()
);
`);
}