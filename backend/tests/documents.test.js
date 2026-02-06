const request = require("supertest");
const app = require("../src/app"); // your express app (NOT server.js)

describe("GET /api/documents", () => {
  it("should return a list of documents", async () => {
    const res = await request(app).get("/api/documents");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("pagination");
  });
});
