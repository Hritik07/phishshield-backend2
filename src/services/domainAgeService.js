const whois = require("node-whois");
const { whois: whoisConfig } = require("../config");
const logger = require("../utils/logger");

/**
 * Returns domain age in days, or null on failure.
 */
async function getDomainAgeDays(domain) {
  return new Promise((resolve) => {
    whois.lookup(domain, { timeout: whoisConfig.timeout }, (err, data) => {
      if (err) {
        logger.warn(`WHOIS lookup failed for ${domain}: ${err.message}`);
        return resolve(null);
      }

      const creationDateMatch =
        data.match(/Creation Date:\s*(.+)/i) ||
        data.match(/created:\s*(.+)/i) ||
        data.match(/registered:\s*(.+)/i);

      if (!creationDateMatch) return resolve(null);

      const creationDate = new Date(creationDateMatch[1].trim());
      if (isNaN(creationDate.getTime())) return resolve(null);

      const ageDays = Math.floor((Date.now() - creationDate.getTime()) / 86_400_000);
      resolve(ageDays);
    });
  });
}

module.exports = { getDomainAgeDays };
