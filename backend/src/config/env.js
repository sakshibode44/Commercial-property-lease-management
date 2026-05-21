require("dotenv").config();
const joi = require("joi");

const envSchema = joi.object({
  NODE_ENV: joi.string().valid("development", "production", "test").default("development"),
  PORT: joi.number().default(5000),
  // Supabase Configuration (Primary for Production)
  SUPABASE_URL: joi.string().required().description("Supabase project URL"),
  SUPABASE_ANON_KEY: joi.string().required().description("Supabase anon key"),
  SUPABASE_SERVICE_ROLE_KEY: joi.string().required().description("Supabase service role key"),
  // JWT Configuration
  JWT_SECRET: joi.string().min(32).required().description("JWT Secret Key (min 32 chars)"),
  JWT_EXPIRE: joi.string().default("30d"),
  // Email Configuration
  SMTP_HOST: joi.string().default("smtp.gmail.com"),
  SMTP_PORT: joi.number().default(587),
  SMTP_USER: joi.string().allow("").description("SMTP username"),
  SMTP_PASS: joi.string().allow("").description("SMTP password"),
  // Frontend URL for CORS
  FRONTEND_URL: joi.string().default("http://localhost:5173").description("Frontend URL for CORS"),
  // MongoDB (Optional - for backward compatibility)
  MONGODB_URL: joi.string().allow("").description("MongoDB connection string (optional)"),
}).unknown().required();

const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = envVars;
