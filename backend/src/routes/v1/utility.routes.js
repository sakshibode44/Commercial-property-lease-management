const express = require("express");
const utilityController = require("../../controllers/utility.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.use(auth);

router
  .route("/")
  .post(utilityController.createUtility)
  .get(utilityController.getUtilities);

router
  .route("/:utilityId")
  .get(utilityController.getUtility)
  .patch(utilityController.updateUtility)
  .delete(utilityController.deleteUtility);

router.patch("/:utilityId/pay", utilityController.markAsPaid);

module.exports = router;