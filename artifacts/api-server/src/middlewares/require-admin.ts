import type { NextFunction, Request, Response } from "express";
import { verifyAdminToken, type AdminTokenPayload } from "../lib/auth";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    req.admin = verifyAdminToken(token);
    next();
  } catch (err) {
    req.log.warn({ err }, "Invalid admin token");
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
