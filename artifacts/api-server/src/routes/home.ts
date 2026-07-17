import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, jobsTable, resultsTable, admitCardsTable, syllabusTable } from "@workspace/db";
import { GetHomeSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const LATEST_LIMIT = 6;

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
    ...latestJobs.map((j) => ({ id: `job-${j.id}`, type: "job", title: j.title, link: `/jobs/${j.id}` })),
    ...latestResults.map((r) => ({
      id: `result-${r.id}`,
      type: "result",
      title: r.title,
      link: `/results/${r.id}`,
    })),
    ...latestAdmitCards.map((a) => ({
      id: `admit-card-${a.id}`,
      type: "admit_card",
      title: a.title,
      link: `/admit-cards/${a.id}`,
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
