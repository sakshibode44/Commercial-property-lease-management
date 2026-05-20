module.exports = {
  testEnvironment: "node",
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  restoreMocks: true,
  setupFilesAfterEnv: ["./tests/setup.js"],
};
