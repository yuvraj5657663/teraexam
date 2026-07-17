import { Router, type IRouter } from "express";
import { and, desc, eq, or, ilike } from "drizzle-orm";
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

const router: IRouter = Router();

router.get("/results", async (req, res): Promise<void> => {
  const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;

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

  const results = await db
    .select()
    .from(resultsTable)
    .where(and(...conditions))
    .orderBy(desc(resultsTable.resultDate));

  res.json(ListResultsResponse.parse(results));
});

router.get("/results/:id", async (req, res): Promise<void> => {
  const params = GetResultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [result] = await db
    .select()
    .from(resultsTable)
    .where(and(eq(resultsTable.id, params.data.id), eq(resultsTable.status, "published")));

  if (!result) {
    res.status(404).json({ error: "Result not found" });
    return;
  }

  res.json(GetResultResponse.parse(result));
});

router.get("/admin/results", requireAdmin, async (req, res): Promise<void> => {
  const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
  const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;

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

  const results = await db
    .select()
    .from(resultsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(resultsTable.createdAt));

  res.json(AdminListResultsResponse.parse(results));
});

router.post("/admin/results", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateResultBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const values = withDateStrings(parsed.data, ["resultDate"]);
  const [result] = await db.insert(resultsTable).values(values).returning();

  res.status(201).json(CreateResultResponse.parse(result));
});

router.patch("/admin/results/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateResultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateResultBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const values = withDateStrings(parsed.data, ["resultDate"]);
  const [result] = await db
    .update(resultsTable)
    .set(values)
    .where(eq(resultsTable.id, params.data.id))
    .returning();

  if (!result) {
    res.status(404).json({ error: "Result not found" });
    return;
  }

  res.json(UpdateResultResponse.parse(result));
});

router.delete("/admin/results/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteResultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [result] = await db
    .delete(resultsTable)
    .where(eq(resultsTable.id, params.data.id))
    .returning();

  if (!result) {
    res.status(404).json({ error: "Result not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
