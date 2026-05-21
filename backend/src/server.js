const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");
const { startScheduler } = require("./utils/scheduler");
const { initSupabase } = require("./config/supabase");

let server;

// Initialize Supabase and start server
async function startServer() {
  try {
    // Initialize Supabase connection
    const supabase = initSupabase();
    logger.info("Supabase initialized successfully");

    // Start Express server
    server = app.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${env.PORT}/health`);
    });

    // Start automated tasks scheduler
    startScheduler();

  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error("Unexpected error:", error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
