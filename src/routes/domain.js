const express = require("express");
const router = express.Router();
const { getDomainAge } = require("../controllers/domainController");
router.get("/age", getDomainAge);
module.exports = router;
