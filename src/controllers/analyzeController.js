const { getDomainAgeDays } = require("../services/domainAgeService");
const { analyzeUrlSimilarity } = require("../services/urlSimilarityService");
const { analyzeWithGemini } = require("../services/geminiService");
const { calculateRiskScore } = require("../services/riskScoreService");
const { isTrustedDomain } = require("../services/trustedListService");
const { isDomainFlagged, logPhishingReport } = require("../services/snowflakeService");
const { riskThresholds } = require("../config");
const logger = require("../utils/logger");

/**
 * POST /api/analyze
 * Body: { domain, url, hasHttps, pageSnippet? }
 */
async function analyzeUrl(req, res, next) {
  try {
    const { domain, url, hasHttps, pageSnippet } = req.body;

    // Layer 0: Trusted list fast exit
    const trusted = await isTrustedDomain(domain);
    if (trusted) {
      return res.json({ trusted: true, score: 100, deductions: [], riskLevel: "safe" });
    }

    // Layer 0b: Snowflake intelligence – already flagged?
    const alreadyFlagged = await isDomainFlagged(domain).catch(() => false);

    // Layer 1: Fast local checks
    const domainAgeDays = await getDomainAgeDays(domain);
    const { similarDomain, suspiciousUrl, closestBrand } = analyzeUrlSimilarity(domain);

    // Intermediate score without AI
    let { score, deductions } = calculateRiskScore({
      domainAgeDays,
      hasHttps: !!hasHttps,
      suspiciousUrl,
      similarDomain,
      aiProbability: null,
    });

    if (alreadyFlagged) {
      score = Math.min(score, 30);
      deductions.push({ reason: "Domain flagged in intelligence database", value: 0 });
    }

    // Layer 2 / 3: Gemini – only when score is below trigger threshold
    let aiProbability = null;
    if (score < riskThresholds.geminiTrigger && pageSnippet) {
      logger.info(`Score ${score} below threshold – triggering Gemini for ${domain}`);
      aiProbability = await analyzeWithGemini(pageSnippet);

      if (aiProbability !== null) {
        ({ score, deductions } = calculateRiskScore({
          domainAgeDays,
          hasHttps: !!hasHttps,
          suspiciousUrl,
          similarDomain,
          aiProbability,
        }));
      }
    }

    const riskLevel =
      score < riskThresholds.highRisk
        ? "high"
        : score < riskThresholds.moderateRisk
        ? "moderate"
        : "safe";

    // Async log to Snowflake (non-blocking)
    if (riskLevel !== "safe") {
      logPhishingReport({ domain, riskScore: score, metadata: { url, aiProbability, closestBrand } })
        .catch((err) => logger.warn(`Snowflake log failed: ${err.message}`));
    }

    return res.json({
      trusted: false,
      score,
      riskLevel,
      deductions,
      domainAgeDays,
      similarDomain,
      closestBrand,
      aiProbability,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeUrl };
