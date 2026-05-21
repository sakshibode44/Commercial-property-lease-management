const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");
const routesV1 = require("./routes/v1");
const envVars = require("./config/env");

const app = express();

// Set security HTTP headers
app.use(helmet());

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Enable cors with environment-specific configuration
const corsOptions = {
  origin: envVars.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// HTTP request logger
app.use(morgan("dev"));

// API v1 routes
app.use("/api/v1", routesV1);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});

// Handle errors
app.use(errorHandler);

module.exports = app;
