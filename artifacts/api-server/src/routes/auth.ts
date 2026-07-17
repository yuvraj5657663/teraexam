import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminsTable } from "@workspace/db";
import { LoginBody, LoginResponse, GetMeResponse } from "@workspace/api-zod";
import { comparePassword, signAdminToken } from "../lib/auth";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.username, parsed.data.username));

  if (!admin) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const ok = await comparePassword(parsed.data.password, admin.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signAdminToken({ adminId: admin.id, username: admin.username });

  res.json(
    LoginResponse.parse({
      token,
      admin: { id: admin.id, username: admin.username, createdAt: admin.createdAt },
    }),
  );
});

router.get("/auth/me", requireAdmin, async (req, res): Promise<void> => {
  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.id, req.admin!.adminId));

  if (!admin) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(
    GetMeResponse.parse({ id: admin.id, username: admin.username, createdAt: admin.createdAt }),
  );
});

export default router;
