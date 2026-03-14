# PhishShield Backend

Node.js / Express backend powering the PhishShield Chrome extension.

## Directory Structure

```
phishshield-backend/
├── src/
│   ├── index.js               # Entry point
│   ├── app.js                 # Express setup, routes, middleware
│   ├── config/
│   │   └── index.js           # Centralised config + risk deduction values
│   ├── routes/
│   │   ├── analyze.js         # POST /api/analyze
│   │   ├── domain.js          # GET  /api/domain/age
│   │   ├── trustedList.js     # GET  /api/trusted-list
│   │   └── report.js          # POST /api/report
│   ├── controllers/
│   │   ├── analyzeController.js     # 3-layer detection orchestration
│   │   ├── domainController.js      # Domain age lookup
│   │   ├── trustedListController.js # Trusted domain list
│   │   └── reportController.js      # User-submitted reports
│   ├── services/
│   │   ├── riskScoreService.js      # Score calculation (deduction model)
│   │   ├── domainAgeService.js      # WHOIS lookup → age in days
│   │   ├── urlSimilarityService.js  # Levenshtein distance + pattern checks
│   │   ├── geminiService.js         # Gemini AI phishing analysis
│   │   ├── trustedListService.js    # Remote JSON list + caching
│   │   └── snowflakeService.js      # Phishing intelligence DB
│   ├── middleware/
│   │   ├── rateLimiter.js           # 60 req/min per IP
│   │   ├── validateRequest.js       # Joi schema validation
│   │   ├── requestLogger.js         # Request logging
│   │   └── errorHandler.js          # Global error handler
│   └── utils/
│       ├── logger.js                # Winston logger
│       └── sensitiveDataDetector.js # Luhn + Aadhaar pattern detection
├── tests/
│   ├── riskScore.test.js
│   ├── urlSimilarity.test.js
│   └── sensitiveData.test.js
├── logs/                            # Auto-created by Winston
├── .env.example
├── .gitignore
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Full 3-layer phishing analysis |
| GET | `/api/domain/age?domain=` | WHOIS domain age lookup |
| GET | `/api/trusted-list` | Fetch current trusted domains list |
| GET | `/api/trusted-list/check?domain=` | Check if a domain is trusted |
| POST | `/api/report` | Submit a user phishing report |
| GET | `/health` | Health check |

## Detection Flow

```
POST /api/analyze
  ↓
Trusted list check → early exit if trusted
  ↓
Snowflake intelligence check (already flagged?)
  ↓
Layer 1: WHOIS age + HTTPS check
  ↓
Layer 2: Levenshtein similarity + suspicious URL patterns
  ↓
Risk score calculated
  ↓
score < 60 AND pageSnippet provided?
  ↓ YES
Layer 3: Gemini AI analysis (200–500 chars only)
  ↓
Final score + riskLevel (safe / moderate / high)
  ↓
Non-blocking log to Snowflake if risky
```

## Setup

```bash
cp .env.example .env
# Fill in your API keys in .env

npm install
npm run dev       # development
npm start         # production
npm test          # run Jest tests
```

## Risk Score Deductions

| Condition | Points Deducted |
|-----------|----------------|
| Domain age < 7 days | 60 |
| Domain age < 30 days | 40 |
| No HTTPS | 20 |
| Suspicious URL pattern | 15 |
| Domain similar to known brand | 25 |
| Gemini AI probability > 0.75 | 40 |
