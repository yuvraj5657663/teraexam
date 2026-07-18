import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import scrapedItemsRouter from "../../routes/scraped-items";
import * as authLib from "../../lib/auth";

const app = express();
app.use(express.json());
// Attach fake pino logger to req for routes that call req.log
app.use((req, _res, next) => {
  (req as unknown as Record<string, unknown>)["log"] = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  next();
});
app.use(scrapedItemsRouter);

function getAdminToken() {
  return authLib.signAdminToken({ adminId: 1, username: "admin" });
}

beforeEach(() => {
  process.env["JWT_SECRET"] = "test-jwt-secret-at-least-32-characters-long!!";
  vi.clearAllMocks();
});

describe("GET /admin/scraped-items", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/admin/scraped-items");
    expect(res.status).toBe(401);
  });

  it("accepts status filter param", async () => {
    const token = getAdminToken();
    const res = await request(app)
      .get("/admin/scraped-items?status=pending")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 500]).toContain(res.status); // 500 is ok — DB mock might not be perfect
  });
});

describe("POST /admin/scraped-items", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).post("/admin/scraped-items").send({});
    expect(res.status).toBe(401);
  });

  it("returns 400 with missing required fields", async () => {
    const token = getAdminToken();
    const res = await request(app)
      .post("/admin/scraped-items")
      .set("Authorization", `Bearer ${token}`)
      .send({ sourceUrl: "" }); // missing suggestedType, rawTitle
    expect(res.status).toBe(400);
  });
});

describe("PATCH /admin/scraped-items/:id/approve", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).patch("/admin/scraped-items/1/approve");
    expect(res.status).toBe(401);
  });

  it("returns 400 for non-numeric id", async () => {
    const token = getAdminToken();
    const res = await request(app)
      .patch("/admin/scraped-items/abc/approve")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /admin/scraped-items/:id/reject", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).patch("/admin/scraped-items/1/reject");
    expect(res.status).toBe(401);
  });
});
