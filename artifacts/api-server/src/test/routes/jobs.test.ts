import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jobsRouter from "../../routes/jobs";
import { db } from "@workspace/db";
import * as authLib from "../../lib/auth";

const app = express();
app.use(express.json());
app.use(jobsRouter);

const MOCK_JOB = {
  id: 1,
  title: "SSC CGL 2026",
  organization: "Staff Selection Commission",
  examName: "SSC CGL 2026",
  postDate: "2026-07-01",
  lastDate: "2026-08-05",
  applyLink: "https://ssc.nic.in",
  description: "Test description",
  vacancies: 4500,
  category: "Central Government",
  status: "published",
  slug: "ssc-cgl-2026",
  createdAt: new Date("2026-07-01"),
  updatedAt: new Date("2026-07-01"),
};

// Helper to get a valid admin JWT
function getAdminToken(): string {
  return (authLib as typeof authLib).signAdminToken({ adminId: 1, username: "admin" });
}

beforeEach(() => {
  process.env["JWT_SECRET"] = "test-jwt-secret-at-least-32-characters-long!!";
  vi.clearAllMocks();
});

// ---- Public endpoints ----

describe("GET /jobs", () => {
  it("returns paginated list of published jobs", async () => {
    const mockDb = db as unknown as { select: ReturnType<typeof vi.fn> };
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([MOCK_JOB]),
              }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 1 }]),
        }),
      });

    const res = await request(app).get("/jobs");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
  });

  it("accepts search query param", async () => {
    const res = await request(app).get("/jobs?search=SSC");
    // Even with mock returning empty, it should not crash
    expect(res.status).toBe(200);
  });

  it("accepts page and limit query params", async () => {
    const res = await request(app).get("/jobs?page=2&limit=5");
    expect(res.status).toBe(200);
  });
});

describe("GET /jobs/:id", () => {
  it("returns 400 for non-numeric id", async () => {
    const res = await request(app).get("/jobs/not-a-number");
    expect(res.status).toBe(400);
  });
});

// ---- Admin endpoints ----

describe("GET /admin/jobs", () => {
  it("returns 401 without auth token", async () => {
    const res = await request(app).get("/admin/jobs");
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await request(app)
      .get("/admin/jobs")
      .set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
  });
});

describe("POST /admin/jobs", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).post("/admin/jobs").send({ title: "Test" });
    expect(res.status).toBe(401);
  });

  it("returns 400 with invalid body (even with valid auth)", async () => {
    const token = getAdminToken();
    const res = await request(app)
      .post("/admin/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "" }); // invalid: title too short, missing required fields
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("PATCH /admin/jobs/:id", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).patch("/admin/jobs/1").send({ status: "published" });
    expect(res.status).toBe(401);
  });

  it("returns 400 for non-numeric id", async () => {
    const token = getAdminToken();
    const res = await request(app)
      .patch("/admin/jobs/abc")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "published" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /admin/jobs/:id", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).delete("/admin/jobs/1");
    expect(res.status).toBe(401);
  });

  it("returns 400 for non-numeric id", async () => {
    const token = getAdminToken();
    const res = await request(app)
      .delete("/admin/jobs/abc")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
