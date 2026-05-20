const express = require("express");
const paymentController = require("../../controllers/payment.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/check-overdue", paymentController.checkOverduePayments);
router.get("/", paymentController.getPayments);
router.get("/:paymentId", paymentController.getPayment);
router.get("/:paymentId/receipt", paymentController.generateReceipt);
router.patch("/:paymentId/record", paymentController.recordPayment);

module.exports = router;
