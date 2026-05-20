const express = require("express");
const tenantController = require("../../controllers/tenant.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.use(auth);

router
  .route("/")
  .post(tenantController.createTenant)
  .get(tenantController.getTenants);

router
  .route("/:tenantId")
  .get(tenantController.getTenant)
  .patch(tenantController.updateTenant)
  .delete(tenantController.deleteTenant);

module.exports = router;
