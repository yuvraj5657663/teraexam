import { Router, type IRouter } from "express";
import { and, count, desc, eq, or, ilike } from "drizzle-orm";
import { db, resultsTable } from "@workspace/db";
import {
  ListResultsResponse,
  GetResultParams,
  GetResultResponse,
  AdminListResultsResponse,
  CreateResultBody,
  CreateResultResponse,
  UpdateResultParams,
  UpdateResultBody,
  UpdateResultResponse,
  DeleteResultParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import { withDateStrings } from "../lib/dates";
import { parsePagination, paginate } from "../lib/pagination";

const router: IRouter = Router();

router.get("/results", async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [eq(resultsTable.status, "published")];
    if (search) {
      conditions.push(
        or(
          ilike(resultsTable.title, `%${search}%`),
          ilike(resultsTable.organization, `%${search}%`),
          ilike(resultsTable.examName, `%${search}%`),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [results, [totalRow]] = await Promise.all([
      db
        .select()
        .from(resultsTable)
        .where(whereClause)
        .orderBy(desc(resultsTable.resultDate))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(resultsTable).where(whereClause),
    ]);

    res.json(paginate(ListResultsResponse.parse(results), totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

router.get("/results/:id", async (req, res, next): Promise<void> => {
  try {
    const params = GetResultParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid result ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [result] = await db
      .select()
      .from(resultsTable)
      .where(and(eq(resultsTable.id, params.data.id), eq(resultsTable.status, "published")));

    if (!result) {
      res.status(404).json({ error: "Result not found", code: "NOT_FOUND" });
      return;
    }

    res.json(GetResultResponse.parse(result));
  } catch (err) {
    next(err);
  }
});

router.get("/admin/results", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [];
    if (status === "draft" || status === "published") {
      conditions.push(eq(resultsTable.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(resultsTable.title, `%${search}%`),
          ilike(resultsTable.organization, `%${search}%`),
          ilike(resultsTable.examName, `%${search}%`),
        )!,
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [results, [totalRow]] = await Promise.all([
      db
        .select()
        .from(resultsTable)
        .where(whereClause)
        .orderBy(desc(resultsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(resultsTable).where(whereClause),
    ]);

    res.json(paginate(AdminListResultsResponse.parse(results), totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/results", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateResultBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const values = withDateStrings(parsed.data, ["resultDate"]);
    const [result] = await db.insert(resultsTable).values(values).returning();

    res.status(201).json(CreateResultResponse.parse(result));
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/results/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = UpdateResultParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid result ID", code: "VALIDATION_ERROR" });
      return;
    }

    const parsed = UpdateResultBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const values = withDateStrings(parsed.data, ["resultDate"]);
    const [result] = await db
      .update(resultsTable)
      .set(values)
      .where(eq(resultsTable.id, params.data.id))
      .returning();

    if (!result) {
      res.status(404).json({ error: "Result not found", code: "NOT_FOUND" });
      return;
    }

    res.json(UpdateResultResponse.parse(result));
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/results/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = DeleteResultParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid result ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [result] = await db
      .delete(resultsTable)
      .where(eq(resultsTable.id, params.data.id))
      .returning();

    if (!result) {
      res.status(404).json({ error: "Result not found", code: "NOT_FOUND" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
