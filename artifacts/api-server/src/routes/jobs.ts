import { Router, type IRouter } from "express";
import { and, desc, eq, or, ilike } from "drizzle-orm";
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

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;

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

  const jobs = await db
    .select()
    .from(jobsTable)
    .where(and(...conditions))
    .orderBy(desc(jobsTable.postDate));

  res.json(ListJobsResponse.parse(jobs));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(and(eq(jobsTable.id, params.data.id), eq(jobsTable.status, "published")));

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetJobResponse.parse(job));
});

router.get("/admin/jobs", requireAdmin, async (req, res): Promise<void> => {
  const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
  const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;

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

  const jobs = await db
    .select()
    .from(jobsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(jobsTable.createdAt));

  res.json(AdminListJobsResponse.parse(jobs));
});

router.post("/admin/jobs", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const values = withDateStrings(parsed.data, ["postDate", "lastDate"]);
  const [job] = await db.insert(jobsTable).values(values).returning();

  res.status(201).json(CreateJobResponse.parse(job));
});

router.patch("/admin/jobs/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const values = withDateStrings(parsed.data, ["postDate", "lastDate"]);
  const [job] = await db
    .update(jobsTable)
    .set(values)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(UpdateJobResponse.parse(job));
});

router.delete("/admin/jobs/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
