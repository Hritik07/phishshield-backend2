const levenshtein = require("fast-levenshtein");

// Popular brand domains to compare against
const BRAND_DOMAINS = [
  "google.com", "facebook.com", "amazon.com", "paypal.com",
  "apple.com", "microsoft.com", "netflix.com", "instagram.com",
  "twitter.com", "linkedin.com", "sbi.co.in", "hdfcbank.com",
  "icicibank.com", "axisbank.com", "paytm.com", "phonepe.com",
];

const SUSPICIOUS_PATTERNS = [
  /secure[-.]?login/i,
  /verify[-.]?account/i,
  /update[-.]?info/i,
  /confirm[-.]?payment/i,
  /\d{4,}/,          // long numeric strings in domain
  /-{2,}/,           // multiple consecutive hyphens
];

/**
 * @param {string} domain - Hostname to check (e.g. "paypa1.com")
 * @returns {{ similarDomain: boolean, suspiciousUrl: boolean, closestBrand: string|null, distance: number|null }}
 */
function analyzeUrlSimilarity(domain) {
  const strippedDomain = domain.replace(/^www\./, "").toLowerCase();

  let closestBrand = null;
  let minDistance = Infinity;

  for (const brand of BRAND_DOMAINS) {
    const brandName = brand.split(".")[0];
    const inputName = strippedDomain.split(".")[0];
    const dist = levenshtein.get(inputName, brandName);

    if (dist < minDistance) {
      minDistance = dist;
      closestBrand = brand;
    }
  }

  // Similar if edit distance is small but NOT equal (exact match = legitimate)
  const similarDomain = minDistance > 0 && minDistance <= 3;

  const suspiciousUrl = SUSPICIOUS_PATTERNS.some((pattern) =>
    pattern.test(strippedDomain)
  );

  return {
    similarDomain,
    suspiciousUrl,
    closestBrand: similarDomain ? closestBrand : null,
    distance: similarDomain ? minDistance : null,
  };
}

module.exports = { analyzeUrlSimilarity };
