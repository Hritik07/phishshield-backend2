const axios = require("axios");
const { gemini } = require("../config");
const logger = require("../utils/logger");

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${gemini.model}:generateContent`;

/**
 * Sends a small text snippet (200–500 chars) to Gemini for phishing analysis.
 * Returns a probability between 0 and 1, or null on failure.
 *
 * @param {string} pageSnippet - Extracted suspicious content from the page
 * @returns {Promise<number|null>}
 */
async function analyzeWithGemini(pageSnippet) {
  const truncated = pageSnippet.slice(0, gemini.maxChars);

  const prompt = `
You are a phishing detection expert. Analyze the following web page content snippet.
Respond ONLY with a JSON object in this exact format:
{ "phishing_probability": <number between 0 and 1>, "reason": "<brief reason>" }

Page snippet:
"""
${truncated}
"""
`.trim();

  try {
    const response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${gemini.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 100 },
      },
      { timeout: 8000 }
    );

    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const prob = parseFloat(parsed.phishing_probability);
    if (isNaN(prob) || prob < 0 || prob > 1) return null;

    logger.info(`Gemini analysis complete – probability: ${prob}, reason: ${parsed.reason}`);
    return prob;
  } catch (err) {
    logger.error(`Gemini API error: ${err.message}`);
    return null;
  }
}

module.exports = { analyzeWithGemini };
