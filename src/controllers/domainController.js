const { getDomainAgeDays } = require("../services/domainAgeService");

/**
 * GET /api/domain/age?domain=example.com
 */
async function getDomainAge(req, res, next) {
  try {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "domain query param required" });

    const ageDays = await getDomainAgeDays(domain);
    return res.json({ domain, ageDays });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDomainAge };
