const { analyzeUrlSimilarity } = require("../src/services/urlSimilarityService");

describe("analyzeUrlSimilarity", () => {
  test("detects paypal typosquat", () => {
    const result = analyzeUrlSimilarity("paypa1.com");
    expect(result.similarDomain).toBe(true);
    expect(result.closestBrand).toBe("paypal.com");
  });

  test("legitimate paypal passes", () => {
    const result = analyzeUrlSimilarity("paypal.com");
    expect(result.similarDomain).toBe(false);
  });

  test("detects suspicious URL pattern", () => {
    const result = analyzeUrlSimilarity("secure-login-verify.com");
    expect(result.suspiciousUrl).toBe(true);
  });

  test("clean unrelated domain is safe", () => {
    const result = analyzeUrlSimilarity("mynewblog.io");
    expect(result.similarDomain).toBe(false);
    expect(result.suspiciousUrl).toBe(false);
  });
});
