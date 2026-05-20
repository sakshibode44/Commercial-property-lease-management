require("dotenv").config();
const joi = require("joi");

const envSchema = joi.object({
  NODE_ENV: joi.string().valid("development", "production", "test").default("development"),
  PORT: joi.number().default(5000),
  MONGODB_URL: joi.string().default("mongodb://localhost:27017/property-management").description("MongoDB connection string"),
  JWT_SECRET: joi.string().default("your_jwt_secret_here").description("JWT Secret Key"),
  JWT_EXPIRE: joi.string().default("30d"),
  SMTP_HOST: joi.string().default("smtp.gmail.com"),
  SMTP_PORT: joi.number().default(587),
  SMTP_USER: joi.string().allow("").description("SMTP username"),
  SMTP_PASS: joi.string().allow("").description("SMTP password"),
}).unknown().required();

const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = envVars;
