import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env["JWT_SECRET"];

export interface AdminTokenPayload {
  adminId: number;
  username: string;
}

function getSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required but was not provided.");
  }
  return JWT_SECRET;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, getSecret()) as AdminTokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
