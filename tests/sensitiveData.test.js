const { luhnCheck, detectSensitiveData } = require("../src/utils/sensitiveDataDetector");

describe("luhnCheck", () => {
  test("valid Visa card", () => expect(luhnCheck("4111111111111111")).toBe(true));
  test("invalid number", () => expect(luhnCheck("1234567890123456")).toBe(false));
  test("valid Mastercard", () => expect(luhnCheck("5500005555555559")).toBe(true));
});

describe("detectSensitiveData", () => {
  test("detects credit card", () => {
    const result = detectSensitiveData("Card: 4111111111111111 thanks");
    expect(result).toContain("credit_card");
  });

  test("detects Aadhaar number", () => {
    const result = detectSensitiveData("My Aadhaar is 1234 5678 9012");
    expect(result).toContain("aadhaar");
  });

  test("returns empty for clean text", () => {
    const result = detectSensitiveData("Hello, how are you?");
    expect(result).toHaveLength(0);
  });
});
