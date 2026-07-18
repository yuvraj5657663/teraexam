import { Router, type IRouter } from "express";
import { and, count, desc, eq, or, ilike } from "drizzle-orm";
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
import { parsePagination, paginate } from "../lib/pagination";

const router: IRouter = Router();

router.get("/syllabus", async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [eq(syllabusTable.status, "published")];
    if (search) {
      conditions.push(
        or(
          ilike(syllabusTable.title, `%${search}%`),
          ilike(syllabusTable.examName, `%${search}%`),
        )!,
      );
    }

    const whereClause = and(...conditions);
    const [entries, [totalRow]] = await Promise.all([
      db
        .select()
        .from(syllabusTable)
        .where(whereClause)
        .orderBy(desc(syllabusTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(syllabusTable).where(whereClause),
    ]);

    res.json(paginate(ListSyllabusResponse.parse(entries), totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

router.get("/syllabus/:id", async (req, res, next): Promise<void> => {
  try {
    const params = GetSyllabusParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid syllabus ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [entry] = await db
      .select()
      .from(syllabusTable)
      .where(and(eq(syllabusTable.id, params.data.id), eq(syllabusTable.status, "published")));

    if (!entry) {
      res.status(404).json({ error: "Syllabus not found", code: "NOT_FOUND" });
      return;
    }

    res.json(GetSyllabusResponse.parse(entry));
  } catch (err) {
    next(err);
  }
});

router.get("/admin/syllabus", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [];
    if (status === "draft" || status === "published") {
      conditions.push(eq(syllabusTable.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(syllabusTable.title, `%${search}%`),
          ilike(syllabusTable.examName, `%${search}%`),
        )!,
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [entries, [totalRow]] = await Promise.all([
      db
        .select()
        .from(syllabusTable)
        .where(whereClause)
        .orderBy(desc(syllabusTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(syllabusTable).where(whereClause),
    ]);

    res.json(paginate(AdminListSyllabusResponse.parse(entries), totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/syllabus", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateSyllabusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const [entry] = await db.insert(syllabusTable).values(parsed.data).returning();
    res.status(201).json(CreateSyllabusResponse.parse(entry));
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/syllabus/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = UpdateSyllabusParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid syllabus ID", code: "VALIDATION_ERROR" });
      return;
    }

    const parsed = UpdateSyllabusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const [entry] = await db
      .update(syllabusTable)
      .set(parsed.data)
      .where(eq(syllabusTable.id, params.data.id))
      .returning();

    if (!entry) {
      res.status(404).json({ error: "Syllabus not found", code: "NOT_FOUND" });
      return;
    }

    res.json(UpdateSyllabusResponse.parse(entry));
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/syllabus/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = DeleteSyllabusParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid syllabus ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [entry] = await db
      .delete(syllabusTable)
      .where(eq(syllabusTable.id, params.data.id))
      .returning();

    if (!entry) {
      res.status(404).json({ error: "Syllabus not found", code: "NOT_FOUND" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
