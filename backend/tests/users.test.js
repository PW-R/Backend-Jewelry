import { expect } from "chai";
import supertest from "supertest";
import app, { initDB } from "../app.js";
import User from "../models/User.js";

const request = supertest(app);

describe("Users API", () => {
  before(async () => {
    await initDB();
  });

  it("GET /api/users should return all users", async () => {
    const res = await request.get("/api/users");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("POST /api/users/register should create a new user", async () => {
    const newUser = {
      title: "Mr.", // <- note the dot
      firstName: "Test",
      lastName: "User",
      age: 25,
      email: `testuser${Date.now()}@example.com`,
      password: "Test1234",
      phone: "0123456789",
      role: "user",
    };

    const res = await request.post("/api/users/register").send(newUser);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message', "User registered successfully.");

  });

  // Cleanup after tests
  after(async () => {
    await User.deleteMany({ email: /testuser/ });
  });
});
