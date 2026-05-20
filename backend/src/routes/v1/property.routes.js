const express = require("express");
const propertyController = require("../../controllers/property.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.use(auth);

router
  .route("/")
  .post(propertyController.createProperty)
  .get(propertyController.getProperties);

router
  .route("/:propertyId")
  .get(propertyController.getProperty)
  .patch(propertyController.updateProperty)
  .delete(propertyController.deleteProperty);

module.exports = router;
