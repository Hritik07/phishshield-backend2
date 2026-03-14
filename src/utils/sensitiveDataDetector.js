/**
 * Luhn algorithm – validates credit card numbers.
 * Returns true if the number passes the Luhn check.
 *
 * @param {string|number} value
 * @returns {boolean}
 */
function luhnCheck(value) {
  const digits = String(value).replace(/\D/g, "");
  if (!digits.length) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Detect sensitive data patterns in a string.
 * Returns a list of detected types.
 *
 * @param {string} text
 * @returns {string[]}
 */
function detectSensitiveData(text) {
  const detected = [];

  // Credit card: 13–19 digits, optionally separated by spaces/dashes
  const ccMatches = text.match(/\b[\d][\d\s\-]{11,17}[\d]\b/g) || [];
  for (const match of ccMatches) {
    const digits = match.replace(/\D/g, "");
    if (digits.length >= 13 && digits.length <= 19 && luhnCheck(digits)) {
      detected.push("credit_card");
      break;
    }
  }

  // Aadhaar: 12-digit number (Indian national ID)
  if (/\b\d{4}\s?\d{4}\s?\d{4}\b/.test(text)) {
    detected.push("aadhaar");
  }

  // Long numeric sequences (potential sensitive IDs)
  if (/\b\d{10,}\b/.test(text)) {
    detected.push("long_numeric_sequence");
  }

  return [...new Set(detected)];
}

module.exports = { luhnCheck, detectSensitiveData };
