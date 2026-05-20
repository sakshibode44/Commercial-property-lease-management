const joi = require("joi");

const register = {
  body: joi.object().keys({
    email: joi.string().required().email(),
    password: joi.string().required().min(8),
    name: joi.string().required(),
    role: joi.string().valid("admin", "manager", "tenant"),
    phone: joi.string(),
  }),
};

const login = {
  body: joi.object().keys({
    email: joi.string().required().email(),
    password: joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
};
