const joi = require("joi");
const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const { value, error } = joi.compile(schema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(req.body, { allowUnknown: true });

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(", ");
    return next(new ApiError(400, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
