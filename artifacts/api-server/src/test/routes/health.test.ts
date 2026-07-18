import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import healthRouter from "../../routes/health";

// pool.query already mocked via setup.ts
const app = express();
app.use(express.json());
app.use(healthRouter);

describe("GET /healthz", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("returns JSON content-type", async () => {
    const res = await request(app).get("/healthz");
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});
