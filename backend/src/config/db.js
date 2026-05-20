const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const DB_FILE = path.join(__dirname, "../../data/database.json");

// Initialize database file if it doesn't exist
const initializeDB = () => {
  const dbDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      properties: [],
      tenants: [],
      leases: [],
      payments: [],
      maintenance: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

const connectDB = async () => {
  try {
    initializeDB();
    logger.info(`Local JSON Database initialized at: ${DB_FILE}`);
    logger.info("Database ready for development use");
  } catch (error) {
    logger.error(`Database initialization error: ${error.message}`);
    process.exit(1);
  }
};

// Helper functions for JSON database operations
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Error reading database: ${error.message}`);
    return {};
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    logger.error(`Error writing database: ${error.message}`);
  }
};

module.exports = { connectDB, readDB, writeDB };
