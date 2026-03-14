const { logPhishingReport } = require("../services/snowflakeService");
const logger = require("../utils/logger");

/**
 * POST /api/report
 * Body: { domain, url, riskScore, reason }
 */
async function submitReport(req, res, next) {
  try {
    const { domain, url, riskScore, reason } = req.body;

    await logPhishingReport({
      domain,
      riskScore: riskScore ?? 0,
      reportedBy: "user",
      metadata: { url, reason },
    });

    logger.info(`User report submitted for domain: ${domain}`);
    res.json({ success: true, message: "Report submitted. Thank you for helping PhishShield." });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitReport };
