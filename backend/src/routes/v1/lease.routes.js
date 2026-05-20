const express = require("express");
const leaseController = require("../../controllers/lease.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/expiring", leaseController.getExpiringLeases);

router
  .route("/")
  .post(leaseController.createLease)
  .get(leaseController.getLeases);

router
  .route("/:leaseId")
  .get(leaseController.getLease)
  .patch(leaseController.updateLease)
  .delete(leaseController.deleteLease);

module.exports = router;
