import { describe, it, expect, beforeAll } from "vitest";
import { signAdminToken, verifyAdminToken, hashPassword, comparePassword } from "../../lib/auth";

describe("JWT auth", () => {
  it("signs and verifies a valid token", () => {
    const payload = { adminId: 1, username: "admin" };
    const token = signAdminToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3); // JWT = header.payload.signature

    const decoded = verifyAdminToken(token);
    expect(decoded.adminId).toBe(1);
    expect(decoded.username).toBe("admin");
  });

  it("throws on tampered token", () => {
    const payload = { adminId: 1, username: "admin" };
    const token = signAdminToken(payload);
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(() => verifyAdminToken(tampered)).toThrow();
  });

  it("throws on completely invalid token", () => {
    expect(() => verifyAdminToken("not-a-jwt")).toThrow();
  });

  it("throws when JWT_SECRET is missing", () => {
    const original = process.env["JWT_SECRET"];
    delete process.env["JWT_SECRET"];
    expect(() => signAdminToken({ adminId: 1, username: "test" })).toThrow("JWT_SECRET");
    process.env["JWT_SECRET"] = original;
  });
});

describe("Password hashing", () => {
  it("hashes a password and verifies it correctly", async () => {
    const plain = "SuperSecret123!";
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt format

    const valid = await comparePassword(plain, hash);
    expect(valid).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("correct-password");
    const valid = await comparePassword("wrong-password", hash);
    expect(valid).toBe(false);
  });

  it("produces different hash each time (salt)", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });
});
