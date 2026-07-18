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

router.get("/subjects", async (_req, res, next): Promise<void> => {
  try {
    const subjects = await db.select().from(subjectsTable).orderBy(asc(subjectsTable.name));
    res.json(ListSubjectsResponse.parse(subjects));
  } catch (err) {
    next(err);
  }
});

router.get("/admin/subjects", requireAdmin, async (_req, res, next): Promise<void> => {
  try {
    const subjects = await db.select().from(subjectsTable).orderBy(asc(subjectsTable.name));
    res.json(AdminListSubjectsResponse.parse(subjects));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/subjects", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateSubjectBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const [subject] = await db.insert(subjectsTable).values(parsed.data).returning();
    res.status(201).json(CreateSubjectResponse.parse(subject));
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/subjects/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = UpdateSubjectParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid subject ID", code: "VALIDATION_ERROR" });
      return;
    }

    const parsed = UpdateSubjectBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const [subject] = await db
      .update(subjectsTable)
      .set(parsed.data)
      .where(eq(subjectsTable.id, params.data.id))
      .returning();

    if (!subject) {
      res.status(404).json({ error: "Subject not found", code: "NOT_FOUND" });
      return;
    }

    res.json(UpdateSubjectResponse.parse(subject));
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/subjects/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = DeleteSubjectParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid subject ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [subject] = await db
      .delete(subjectsTable)
      .where(eq(subjectsTable.id, params.data.id))
      .returning();

    if (!subject) {
      res.status(404).json({ error: "Subject not found", code: "NOT_FOUND" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
