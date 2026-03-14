const logger = require("../utils/logger");

function requestLogger(req, _res, next) {
  logger.info(`${req.method} ${req.path} – IP: ${req.ip}`);
  next();
}

module.exports = { requestLogger };
