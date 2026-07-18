import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import authRouter from "../../routes/auth";
import { db, adminsTable } from "@workspace/db";
import * as authLib from "../../lib/auth";

const app = express();
app.use(express.json());
app.use(authRouter);

const MOCK_ADMIN = {
  id: 1,
  username: "admin",
  passwordHash: "$2a$10$mockhashmockhashmockhashmockhashmockhash",
  createdAt: new Date("2026-01-01"),
};

beforeAll(() => {
  process.env["JWT_SECRET"] = "test-jwt-secret-at-least-32-characters-long!!";
});

describe("POST /auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when body is missing required fields", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 when username is empty string", async () => {
    const res = await request(app).post("/auth/login").send({ username: "", password: "test" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is empty string", async () => {
    const res = await request(app).post("/auth/login").send({ username: "admin", password: "" });
    expect(res.status).toBe(400);
  });

  it("returns 401 when admin is not found", async () => {
    // DB returns empty array (no admin found)
    const mockDb = db as unknown as { select: ReturnType<typeof vi.fn> };
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ username: "nonexistent", password: "password" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns 401 when password is wrong", async () => {
    const mockDb = db as unknown as { select: ReturnType<typeof vi.fn> };
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([MOCK_ADMIN]),
      }),
    });
    vi.spyOn(authLib, "comparePassword").mockResolvedValue(false);

    const res = await request(app)
      .post("/auth/login")
      .send({ username: "admin", password: "wrongpassword" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns 200 with token on valid credentials", async () => {
    const mockDb = db as unknown as { select: ReturnType<typeof vi.fn> };
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([MOCK_ADMIN]),
      }),
    });
    vi.spyOn(authLib, "comparePassword").mockResolvedValue(true);

    const res = await request(app)
      .post("/auth/login")
      .send({ username: "admin", password: "correct" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("admin");
    expect(res.body.admin.username).toBe("admin");
    // Token should not expose passwordHash
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });
});

describe("GET /auth/me", () => {
  it("returns 401 when no Authorization header", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is malformed", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("returns 401 when Authorization header missing Bearer prefix", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", "Token sometoken");
    expect(res.status).toBe(401);
  });
});
