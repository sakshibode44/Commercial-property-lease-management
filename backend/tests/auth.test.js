const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Auth Routes", () => {
  const newUser = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    role: "admin",
  };

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/v1/auth/register", () => {
    test("should register a new user", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(newUser)
        .expect(201);

      expect(res.body.data.user).toHaveProperty("email", newUser.email);
      expect(res.body.data).toHaveProperty("token");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    test("should login an existing user", async () => {
      await request(app).post("/api/v1/auth/register").send(newUser);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      expect(res.body.data).toHaveProperty("token");
    });
  });
});
