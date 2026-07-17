import { Router, type IRouter } from "express";
import { count, eq } from "drizzle-orm";
import {
  db,
  jobsTable,
  resultsTable,
  admitCardsTable,
  syllabusTable,
  questionsTable,
  scrapedItemsTable,
} from "@workspace/db";
import { GetAdminDashboardSummaryResponse } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/admin/dashboard/summary", requireAdmin, async (_req, res): Promise<void> => {
  const [[jobs], [results], [admitCards], [syllabus], [questions], [pending]] = await Promise.all([
    db.select({ value: count() }).from(jobsTable),
    db.select({ value: count() }).from(resultsTable),
    db.select({ value: count() }).from(admitCardsTable),
    db.select({ value: count() }).from(syllabusTable),
    db.select({ value: count() }).from(questionsTable),
    db.select({ value: count() }).from(scrapedItemsTable).where(eq(scrapedItemsTable.status, "pending")),
  ]);

  res.json(
    GetAdminDashboardSummaryResponse.parse({
      totalJobs: jobs?.value ?? 0,
      totalResults: results?.value ?? 0,
      totalAdmitCards: admitCards?.value ?? 0,
      totalSyllabus: syllabus?.value ?? 0,
      totalQuestions: questions?.value ?? 0,
      pendingScrapedItems: pending?.value ?? 0,
    }),
  );
});

export default router;
