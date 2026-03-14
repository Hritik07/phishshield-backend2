module.exports = {
  port: process.env.PORT || 3000,
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-pro",
    maxChars: 500, // Only send 200–500 chars to Gemini per doc spec
  },
  whois: {
    timeout: 5000,
  },
  snowflake: {
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USER,
    password: process.env.SNOWFLAKE_PASSWORD,
    database: process.env.SNOWFLAKE_DATABASE,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    schema: process.env.SNOWFLAKE_SCHEMA || "PUBLIC",
  },
  riskThresholds: {
    geminiTrigger: 60,  // Call Gemini only when score drops below this
    highRisk: 40,
    moderateRisk: 70,
  },
  riskDeductions: {
    domainAgeLt7Days: 60,
    domainAgeLt30Days: 40,
    suspiciousUrlPattern: 15,
    domainSimilarity: 25,
    aiPhishingProbabilityHigh: 40, // triggered when Gemini prob > 0.75
    noHttps: 20,
  },
};
