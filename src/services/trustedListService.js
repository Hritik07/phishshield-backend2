const axios = require("axios");
const logger = require("../utils/logger");

const REMOTE_TRUSTED_LIST_URL =
  process.env.TRUSTED_LIST_URL ||
  "https://raw.githubusercontent.com/your-org/phishshield-lists/main/trusted.json";

let cachedList = [];
let lastFetched = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Returns the current trusted domains list (auto-refreshed from remote JSON).
 */
async function getTrustedDomains() {
  const now = Date.now();
  if (cachedList.length && now - lastFetched < CACHE_TTL_MS) {
    return cachedList;
  }

  try {
    const { data } = await axios.get(REMOTE_TRUSTED_LIST_URL, { timeout: 5000 });
    if (Array.isArray(data)) {
      cachedList = data;
      lastFetched = now;
      logger.info(`Trusted list refreshed – ${cachedList.length} domains`);
    }
  } catch (err) {
    logger.warn(`Failed to refresh trusted list: ${err.message}. Using cached version.`);
  }

  return cachedList;
}

/**
 * Check if a domain is in the trusted list.
 */
async function isTrustedDomain(domain) {
  const list = await getTrustedDomains();
  const stripped = domain.replace(/^www\./, "").toLowerCase();
  return list.includes(stripped);
}

module.exports = { getTrustedDomains, isTrustedDomain };
