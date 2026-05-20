const express = require("express");
const dashboardController = require("../../controllers/dashboard.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;
