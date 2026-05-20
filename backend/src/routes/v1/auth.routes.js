const express = require("express");
const validate = require("../../middleware/validate");
const authValidator = require("../../validators/auth.validator");
const authController = require("../../controllers/auth.controller");
const { authLimiter } = require("../../middleware/rateLimiter");

const router = express.Router();

router.post("/register", validate(authValidator.register), authController.register);
router.post("/login", authLimiter, validate(authValidator.login), authController.login);

module.exports = router;
