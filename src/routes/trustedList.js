const express = require("express");
const router = express.Router();
const { listTrustedDomains, checkTrustedDomain } = require("../controllers/trustedListController");

router.get("/", listTrustedDomains);
router.get("/check", checkTrustedDomain);

module.exports = router;
