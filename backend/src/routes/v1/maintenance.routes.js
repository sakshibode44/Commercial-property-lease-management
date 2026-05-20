const express = require("express");
const maintenanceController = require("../../controllers/maintenance.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.use(auth);

router
  .route("/")
  .post(maintenanceController.createRequest)
  .get(maintenanceController.getRequests);

router
  .route("/:requestId")
  .get(maintenanceController.getRequest)
  .patch(maintenanceController.updateRequest)
  .delete(maintenanceController.deleteRequest);

module.exports = router;
