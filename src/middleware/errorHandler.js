const logger = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  logger.error(`Unhandled error: ${err.message}\n${err.stack}`);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = errorHandler;
