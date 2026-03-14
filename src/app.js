const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { apiLimiter } = require("./middleware/rateLimiter");
const { requestLogger } = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

const analyzeRoutes = require("./routes/analyze");
const domainRoutes = require("./routes/domain");
const trustedListRoutes = require("./routes/trustedList");
const reportRoutes = require("./routes/report");

const app = express();

// Security headers
app.use(helmet());

// CORS – allow only the Chrome extension origin
app.use(
  cors({
     origin: "*", //process.env.ALLOWED_ORIGIN || "chrome-extension://*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(requestLogger);
app.use("/api", apiLimiter);

// Routes
app.use("/api/analyze", analyzeRoutes);
app.use("/api/domain", domainRoutes);
app.use("/api/trusted-list", trustedListRoutes);
app.use("/api/report", reportRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Global error handler
app.use(errorHandler);

module.exports = app;
