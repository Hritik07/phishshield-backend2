const { getTrustedDomains, isTrustedDomain } = require("../services/trustedListService");

/**
 * GET /api/trusted-list
 */
async function listTrustedDomains(_req, res, next) {
  try {
    const domains = await getTrustedDomains();
    res.json({ count: domains.length, domains });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/trusted-list/check?domain=google.com
 */
async function checkTrustedDomain(req, res, next) {
  try {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "domain query param required" });

    const trusted = await isTrustedDomain(domain);
    res.json({ domain, trusted });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTrustedDomains, checkTrustedDomain };
