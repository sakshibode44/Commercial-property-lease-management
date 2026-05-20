const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");
const routesV1 = require("./routes/v1");

const app = express();

// Set security HTTP headers
app.use(helmet());

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Enable cors
app.use(cors());
app.options("*", cors());

// HTTP request logger
app.use(morgan("dev"));

// API v1 routes
app.use("/api/v1", routesV1);

// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});

// Handle errors
app.use(errorHandler);

module.exports = app;
