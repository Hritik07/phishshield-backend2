const { riskDeductions } = require("../config");

/**
 * Calculate a trust score (0–100) for a given domain/URL.
 * Returns the score and a breakdown of applied deductions.
 *
 * @param {Object} params
 * @param {number|null} params.domainAgeDays   - Age of domain in days, null if unknown
 * @param {boolean}     params.hasHttps        - Whether the site uses HTTPS
 * @param {boolean}     params.suspiciousUrl   - Whether URL pattern is suspicious
 * @param {boolean}     params.similarDomain   - Whether domain is similar to a known brand
 * @param {number|null} params.aiProbability   - Gemini phishing probability (0–1), null if not run
 * @returns {{ score: number, deductions: Object[] }}
 */
function calculateRiskScore({ domainAgeDays, hasHttps, suspiciousUrl, similarDomain, aiProbability }) {
  let score = 100;
  const deductions = [];

  if (domainAgeDays !== null && domainAgeDays < 7) {
    score -= riskDeductions.domainAgeLt7Days;
    deductions.push({ reason: "Domain age < 7 days", value: riskDeductions.domainAgeLt7Days });
  } else if (domainAgeDays !== null && domainAgeDays < 30) {
    score -= riskDeductions.domainAgeLt30Days;
    deductions.push({ reason: "Domain age < 30 days", value: riskDeductions.domainAgeLt30Days });
  }

  if (!hasHttps) {
    score -= riskDeductions.noHttps;
    deductions.push({ reason: "No HTTPS", value: riskDeductions.noHttps });
  }

  if (suspiciousUrl) {
    score -= riskDeductions.suspiciousUrlPattern;
    deductions.push({ reason: "Suspicious URL pattern", value: riskDeductions.suspiciousUrlPattern });
  }

  if (similarDomain) {
    score -= riskDeductions.domainSimilarity;
    deductions.push({ reason: "Domain similarity detected", value: riskDeductions.domainSimilarity });
  }

  if (aiProbability !== null && aiProbability > 0.75) {
    score -= riskDeductions.aiPhishingProbabilityHigh;
    deductions.push({ reason: "AI phishing probability > 0.75", value: riskDeductions.aiPhishingProbabilityHigh });
  }

  return { score: Math.max(0, score), deductions };
}

module.exports = { calculateRiskScore };
