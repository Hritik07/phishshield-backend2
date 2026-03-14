const express = require("express");
const router = express.Router();
const { analyzeUrl } = require("../controllers/analyzeController");
const { validateAnalyzeRequest } = require("../middleware/validateRequest");

router.post("/", validateAnalyzeRequest, analyzeUrl);

module.exports = router;
