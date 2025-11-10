import { expect } from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import app, { initDB } from "../app.js";
import Click from "../models/Click.js";

const request = supertest(app);

let authToken;
const testUserId = "690f772e79a5bcc8a9fcd2d7"; // Admin user
const testProductId = "690a2bd41338f5b1183e126c"; // Existing product

describe("Clicks API", () => {

  before(async () => {
    await initDB();

    // Login as admin to get token
    const res = await request.post("/api/users/login").send({
      email: "admin@example.com",
      password: "Admin1234"
    });
    authToken = res.body.token;
  });

  after(async () => {
    // Clean up test clicks
    await Click.deleteMany({ $or: [{ userId: testUserId }, { productId: testProductId }] });
  });

  // === USER VIEW HISTORY ===
  it("POST /api/clicks/history should record a user view", async () => {
    const res = await request
      .post("/api/clicks/history")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ userId: testUserId, productId: testProductId });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message").that.includes("updated successfully");
  });

  it("GET /api/clicks/history/:userId should return user view history", async () => {
    const res = await request
      .get(`/api/clicks/history/${testUserId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    if (res.body.length > 0) {
      expect(res.body[0]).to.have.property("type", "history");
      expect(res.body[0]).to.have.property("productId");
    }
  });

  it("DELETE /api/clicks/history/:userId should clear user view history", async () => {
    const res = await request
      .delete(`/api/clicks/history/${testUserId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message").that.includes("cleared");
  });

  // === PRODUCT CLICK ANALYTICS ===
  it("POST /api/clicks/product should record a product click", async () => {
    const res = await request
      .post("/api/clicks/product")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ productId: testProductId });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message").that.includes("recorded");
  });

  it("GET /api/clicks/product/:productId should return product clicks", async () => {
    const res = await request
      .get(`/api/clicks/product/${testProductId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("productId", testProductId);
    expect(res.body).to.have.property("totalClicks").that.is.a("number");
  });

  // === ADMIN ANALYTICS ===
  it("GET /api/clicks/ should return all clicks", async () => {
    const res = await request
      .get("/api/clicks/")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

});
