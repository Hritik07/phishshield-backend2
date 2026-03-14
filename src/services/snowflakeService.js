const snowflake = require("snowflake-sdk");
const { snowflake: sfConfig } = require("../config");
const logger = require("../utils/logger");

let connection = null;

function getConnection() {
  if (connection) return connection;

  connection = snowflake.createConnection({
    account: sfConfig.account,
    username: sfConfig.username,
    password: sfConfig.password,
    database: sfConfig.database,
    warehouse: sfConfig.warehouse,
    schema: sfConfig.schema,
  });

  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        logger.error(`Snowflake connection error: ${err.message}`);
        connection = null;
        return reject(err);
      }
      logger.info("Snowflake connected");
      resolve(conn);
    });
  });
}

/**
 * Execute a SQL query and return rows.
 */
async function query(sql, binds = []) {
  const conn = await getConnection();
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: sql,
      binds,
      complete: (err, _stmt, rows) => {
        if (err) return reject(err);
        resolve(rows);
      },
    });
  });
}

/**
 * Log a phishing report to Snowflake for intelligence gathering.
 */
async function logPhishingReport({ domain, riskScore, reportedBy, metadata }) {
  const sql = `
    INSERT INTO PHISHING_REPORTS (DOMAIN, RISK_SCORE, REPORTED_BY, METADATA, CREATED_AT)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP())
  `;
  await query(sql, [domain, riskScore, reportedBy || "extension", JSON.stringify(metadata)]);
}

/**
 * Check if a domain is already flagged in the intelligence database.
 */
async function isDomainFlagged(domain) {
  const rows = await query(
    "SELECT COUNT(*) AS CNT FROM PHISHING_REPORTS WHERE DOMAIN = ? AND RISK_SCORE < 40",
    [domain]
  );
  return rows[0]?.CNT > 0;
}

module.exports = { query, logPhishingReport, isDomainFlagged };
