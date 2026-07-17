import { Router, type IRouter } from "express";
import { and, desc, eq, or, ilike } from "drizzle-orm";
import { db, syllabusTable } from "@workspace/db";
import {
  ListSyllabusResponse,
  GetSyllabusParams,
  GetSyllabusResponse,
  AdminListSyllabusResponse,
  CreateSyllabusBody,
  CreateSyllabusResponse,
  UpdateSyllabusParams,
  UpdateSyllabusBody,
  UpdateSyllabusResponse,
  DeleteSyllabusParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/syllabus", async (req, res): Promise<void> => {
  const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;

  const conditions = [eq(syllabusTable.status, "published")];
  if (search) {
    conditions.push(
      or(ilike(syllabusTable.title, `%${search}%`), ilike(syllabusTable.examName, `%${search}%`))!,
    );
  }

  const entries = await db
    .select()
    .from(syllabusTable)
    .where(and(...conditions))
    .orderBy(desc(syllabusTable.createdAt));

  res.json(ListSyllabusResponse.parse(entries));
});

router.get("/syllabus/:id", async (req, res): Promise<void> => {
  const params = GetSyllabusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .select()
    .from(syllabusTable)
    .where(and(eq(syllabusTable.id, params.data.id), eq(syllabusTable.status, "published")));

  if (!entry) {
    res.status(404).json({ error: "Syllabus not found" });
    return;
  }

  res.json(GetSyllabusResponse.parse(entry));
});

router.get("/admin/syllabus", requireAdmin, async (req, res): Promise<void> => {
  const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
  const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;

  const conditions = [];
  if (status === "draft" || status === "published") {
    conditions.push(eq(syllabusTable.status, status));
  }
  if (search) {
    conditions.push(
      or(ilike(syllabusTable.title, `%${search}%`), ilike(syllabusTable.examName, `%${search}%`))!,
    );
  }

  const entries = await db
    .select()
    .from(syllabusTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(syllabusTable.createdAt));

  res.json(AdminListSyllabusResponse.parse(entries));
});

router.post("/admin/syllabus", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateSyllabusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db.insert(syllabusTable).values(parsed.data).returning();

  res.status(201).json(CreateSyllabusResponse.parse(entry));
});

router.patch("/admin/syllabus/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateSyllabusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSyllabusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db
    .update(syllabusTable)
    .set(parsed.data)
    .where(eq(syllabusTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Syllabus not found" });
    return;
  }

  res.json(UpdateSyllabusResponse.parse(entry));
});

router.delete("/admin/syllabus/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteSyllabusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .delete(syllabusTable)
    .where(eq(syllabusTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Syllabus not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
