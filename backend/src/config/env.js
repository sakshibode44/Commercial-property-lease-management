require("dotenv").config();
const joi = require("joi");

const envSchema = joi.object({
  NODE_ENV: joi.string().valid("development", "production", "test").default("development"),
  PORT: joi.number().default(5000),
  MONGODB_URL: joi.string().required().description("MongoDB connection string"),
  JWT_SECRET: joi.string().required().description("JWT Secret Key"),
  JWT_EXPIRE: joi.string().default("30d"),
  SMTP_HOST: joi.string().default("smtp.gmail.com"),
  SMTP_PORT: joi.number().default(587),
  SMTP_USER: joi.string().required().description("SMTP username"),
  SMTP_PASS: joi.string().required().description("SMTP password"),
}).unknown().required();

const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = envVars;
