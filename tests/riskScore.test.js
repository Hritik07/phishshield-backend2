const { calculateRiskScore } = require("../src/services/riskScoreService");

describe("calculateRiskScore", () => {
  test("returns 100 for a clean domain", () => {
    const { score } = calculateRiskScore({
      domainAgeDays: 500,
      hasHttps: true,
      suspiciousUrl: false,
      similarDomain: false,
      aiProbability: null,
    });
    expect(score).toBe(100);
  });

  test("deducts 60 for domain < 7 days old", () => {
    const { score } = calculateRiskScore({
      domainAgeDays: 3,
      hasHttps: true,
      suspiciousUrl: false,
      similarDomain: false,
      aiProbability: null,
    });
    expect(score).toBe(40);
  });

  test("deducts 20 for no HTTPS", () => {
    const { score } = calculateRiskScore({
      domainAgeDays: 500,
      hasHttps: false,
      suspiciousUrl: false,
      similarDomain: false,
      aiProbability: null,
    });
    expect(score).toBe(80);
  });

  test("does not go below 0", () => {
    const { score } = calculateRiskScore({
      domainAgeDays: 1,
      hasHttps: false,
      suspiciousUrl: true,
      similarDomain: true,
      aiProbability: 0.9,
    });
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test("applies AI deduction when probability > 0.75", () => {
    const { score, deductions } = calculateRiskScore({
      domainAgeDays: 500,
      hasHttps: true,
      suspiciousUrl: false,
      similarDomain: false,
      aiProbability: 0.9,
    });
    expect(score).toBe(60);
    expect(deductions.some((d) => d.reason.includes("AI"))).toBe(true);
  });
});
