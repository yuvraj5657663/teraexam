import { Router, type IRouter } from "express";
import { and, count, desc, eq, or, ilike } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import {
  ListJobsResponse,
  GetJobParams,
  GetJobResponse,
  AdminListJobsResponse,
  CreateJobBody,
  CreateJobResponse,
  UpdateJobParams,
  UpdateJobBody,
  UpdateJobResponse,
  DeleteJobParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import { withDateStrings } from "../lib/dates";
import { parsePagination, paginate } from "../lib/pagination";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Public: list published jobs (with pagination)
// ---------------------------------------------------------------------------
router.get("/jobs", async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [eq(jobsTable.status, "published")];
    if (search) {
      conditions.push(
        or(
          ilike(jobsTable.title, `%${search}%`),
          ilike(jobsTable.organization, `%${search}%`),
          ilike(jobsTable.examName, `%${search}%`),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [jobs, [totalRow]] = await Promise.all([
      db
        .select()
        .from(jobsTable)
        .where(whereClause)
        .orderBy(desc(jobsTable.postDate))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(jobsTable).where(whereClause),
    ]);

    const parsed = ListJobsResponse.parse(jobs);
    res.json(paginate(parsed, totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Public: get single published job
// ---------------------------------------------------------------------------
router.get("/jobs/:id", async (req, res, next): Promise<void> => {
  try {
    const params = GetJobParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid job ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [job] = await db
      .select()
      .from(jobsTable)
      .where(and(eq(jobsTable.id, params.data.id), eq(jobsTable.status, "published")));

    if (!job) {
      res.status(404).json({ error: "Job not found", code: "NOT_FOUND" });
      return;
    }

    res.json(GetJobResponse.parse(job));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin: list all jobs (with pagination)
// ---------------------------------------------------------------------------
router.get("/admin/jobs", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [];
    if (status === "draft" || status === "published") {
      conditions.push(eq(jobsTable.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(jobsTable.title, `%${search}%`),
          ilike(jobsTable.organization, `%${search}%`),
          ilike(jobsTable.examName, `%${search}%`),
        )!,
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [jobs, [totalRow]] = await Promise.all([
      db
        .select()
        .from(jobsTable)
        .where(whereClause)
        .orderBy(desc(jobsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(jobsTable).where(whereClause),
    ]);

    const parsed = AdminListJobsResponse.parse(jobs);
    res.json(paginate(parsed, totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin: create job
// ---------------------------------------------------------------------------
router.post("/admin/jobs", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateJobBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const values = withDateStrings(parsed.data, ["postDate", "lastDate"]);
    const [job] = await db.insert(jobsTable).values(values).returning();

    res.status(201).json(CreateJobResponse.parse(job));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin: update job
// ---------------------------------------------------------------------------
router.patch("/admin/jobs/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = UpdateJobParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid job ID", code: "VALIDATION_ERROR" });
      return;
    }

    const parsed = UpdateJobBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const values = withDateStrings(parsed.data, ["postDate", "lastDate"]);
    const [job] = await db
      .update(jobsTable)
      .set(values)
      .where(eq(jobsTable.id, params.data.id))
      .returning();

    if (!job) {
      res.status(404).json({ error: "Job not found", code: "NOT_FOUND" });
      return;
    }

    res.json(UpdateJobResponse.parse(job));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin: delete job
// ---------------------------------------------------------------------------
router.delete("/admin/jobs/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = DeleteJobParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid job ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();

    if (!job) {
      res.status(404).json({ error: "Job not found", code: "NOT_FOUND" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
