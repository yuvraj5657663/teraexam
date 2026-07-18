import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { validateEnv } from "../../lib/env";

describe("validateEnv", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    // Set minimal valid env
    process.env["PORT"] = "3001";
    process.env["DATABASE_URL"] = "postgresql://test:test@localhost/testdb";
    process.env["JWT_SECRET"] = "test-jwt-secret-at-least-32-chars-long!!";
    process.env["SESSION_SECRET"] = "test-session-secret-at-least-32-chars!";
    process.env["NODE_ENV"] = "development";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("returns parsed env with valid config", () => {
    const env = validateEnv();
    expect(env.PORT).toBe(3001);
    expect(env.DATABASE_URL).toBe("postgresql://test:test@localhost/testdb");
    expect(env.NODE_ENV).toBe("development");
  });

  it("throws when PORT is missing", () => {
    delete process.env["PORT"];
    expect(() => validateEnv()).toThrow("PORT");
  });

  it("throws when PORT is not a valid number", () => {
    process.env["PORT"] = "not-a-number";
    expect(() => validateEnv()).toThrow("Invalid PORT");
  });

  it("throws when PORT is negative", () => {
    process.env["PORT"] = "-1";
    expect(() => validateEnv()).toThrow("Invalid PORT");
  });

  it("throws when DATABASE_URL is missing", () => {
    delete process.env["DATABASE_URL"];
    expect(() => validateEnv()).toThrow("DATABASE_URL");
  });

  it("throws when JWT_SECRET is missing", () => {
    delete process.env["JWT_SECRET"];
    expect(() => validateEnv()).toThrow("JWT_SECRET");
  });

  it("throws when JWT_SECRET is too short in production", () => {
    process.env["NODE_ENV"] = "production";
    process.env["JWT_SECRET"] = "short";
    expect(() => validateEnv()).toThrow("JWT_SECRET must be at least 32 characters");
  });

  it("parses ALLOWED_ORIGINS correctly", () => {
    process.env["ALLOWED_ORIGINS"] = "https://teraexam.in,https://www.teraexam.in";
    const env = validateEnv();
    expect(env.ALLOWED_ORIGINS).toEqual(["https://teraexam.in", "https://www.teraexam.in"]);
  });

  it("allows wildcard ALLOWED_ORIGINS in development", () => {
    process.env["ALLOWED_ORIGINS"] = "*";
    const env = validateEnv();
    expect(env.ALLOWED_ORIGINS).toEqual(["*"]);
  });

  it("sets LOG_LEVEL to info by default", () => {
    delete process.env["LOG_LEVEL"];
    const env = validateEnv();
    expect(env.LOG_LEVEL).toBe("info");
  });
});
