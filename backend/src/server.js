const app = require("./app");
const env = require("./config/env");
const { connectDB } = require("./config/db");
const logger = require("./utils/logger");
const { startScheduler } = require("./utils/scheduler");

let server;

connectDB().then(() => {
  server = app.listen(env.PORT, () => {
    logger.info(`Listening to port ${env.PORT}`);
  });

  // Start automated tasks scheduler
  startScheduler();
});

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
  logger.error(error);
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
