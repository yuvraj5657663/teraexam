import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, jobsTable, resultsTable, admitCardsTable, syllabusTable } from "@workspace/db";
import { GetHomeSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const LATEST_LIMIT = 6;

type JobRow = (typeof jobsTable.$inferSelect);
type ResultRow = (typeof resultsTable.$inferSelect);
type AdmitCardRow = (typeof admitCardsTable.$inferSelect);
type SyllabusRow = (typeof syllabusTable.$inferSelect);

router.get("/home/summary", async (_req, res): Promise<void> => {
  const [latestJobs, latestResults, latestAdmitCards, latestSyllabus] = await Promise.all([
    db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.status, "published"))
      .orderBy(desc(jobsTable.postDate))
      .limit(LATEST_LIMIT),
    db
      .select()
      .from(resultsTable)
      .where(eq(resultsTable.status, "published"))
      .orderBy(desc(resultsTable.resultDate))
      .limit(LATEST_LIMIT),
    db
      .select()
      .from(admitCardsTable)
      .where(eq(admitCardsTable.status, "published"))
      .orderBy(desc(admitCardsTable.examDate))
      .limit(LATEST_LIMIT),
    db
      .select()
      .from(syllabusTable)
      .where(eq(syllabusTable.status, "published"))
      .orderBy(desc(syllabusTable.createdAt))
      .limit(LATEST_LIMIT),
  ]);

  const tickerItems = [
    ...latestJobs.map((job: JobRow) => ({ id: `job-${job.id}`, type: "job", title: job.title, link: `/jobs/${job.id}` })),
    ...latestResults.map((result: ResultRow) => ({
      id: `result-${result.id}`,
      type: "result",
      title: result.title,
      link: `/results/${result.id}`,
    })),
    ...latestAdmitCards.map((admitCard: AdmitCardRow) => ({
      id: `admit-card-${admitCard.id}`,
      type: "admit_card",
      title: admitCard.title,
      link: `/admit-cards/${admitCard.id}`,
    })),
  ];

  res.json(
    GetHomeSummaryResponse.parse({
      tickerItems,
      latestJobs,
      latestResults,
      latestAdmitCards,
      latestSyllabus,
    }),
  );
});

export default router;
