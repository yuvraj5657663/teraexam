import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, subjectsTable } from "@workspace/db";
import {
  ListSubjectsResponse,
  AdminListSubjectsResponse,
  CreateSubjectBody,
  CreateSubjectResponse,
  UpdateSubjectParams,
  UpdateSubjectBody,
  UpdateSubjectResponse,
  DeleteSubjectParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/subjects", async (_req, res): Promise<void> => {
  const subjects = await db.select().from(subjectsTable).orderBy(asc(subjectsTable.name));
  res.json(ListSubjectsResponse.parse(subjects));
});

router.get("/admin/subjects", requireAdmin, async (_req, res): Promise<void> => {
  const subjects = await db.select().from(subjectsTable).orderBy(asc(subjectsTable.name));
  res.json(AdminListSubjectsResponse.parse(subjects));
});

router.post("/admin/subjects", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [subject] = await db.insert(subjectsTable).values(parsed.data).returning();

  res.status(201).json(CreateSubjectResponse.parse(subject));
});

router.patch("/admin/subjects/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [subject] = await db
    .update(subjectsTable)
    .set(parsed.data)
    .where(eq(subjectsTable.id, params.data.id))
    .returning();

  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }

  res.json(UpdateSubjectResponse.parse(subject));
});

router.delete("/admin/subjects/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [subject] = await db
    .delete(subjectsTable)
    .where(eq(subjectsTable.id, params.data.id))
    .returning();

  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
