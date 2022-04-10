const { Pool } = require("pg");
const pool = new Pool({
    user: process.env.AWS_RDS_USERNAME,
    password: process.env.AWS_RDS_PASSWORD,
    host: process.env.AWS_RDS_HOSTNAME,
    port: process.env.AWS_RDS_PORT,
    database: "postgres",
    max: 20,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0
});

module.exports = {
  async query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query:", { text, duration, rows: res.rowCount });
    return res;
  }
};