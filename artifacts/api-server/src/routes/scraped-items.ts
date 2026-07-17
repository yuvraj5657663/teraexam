import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  scrapedItemsTable,
  jobsTable,
  resultsTable,
  admitCardsTable,
} from "@workspace/db";
import {
  AdminListScrapedItemsResponse,
  CreateScrapedItemBody,
  CreateScrapedItemResponse,
  RunScraperResponse,
  ApproveScrapedItemParams,
  ApproveScrapedItemResponse,
  RejectScrapedItemParams,
  RejectScrapedItemResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import { runScraperOnce } from "../lib/scraper";

const router: IRouter = Router();

router.get("/admin/scraped-items", requireAdmin, async (req, res): Promise<void> => {
  const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;

  const items = await db
    .select()
    .from(scrapedItemsTable)
    .where(
      status === "pending" || status === "approved" || status === "rejected"
        ? eq(scrapedItemsTable.status, status)
        : undefined,
    )
    .orderBy(desc(scrapedItemsTable.scrapedAt));

  res.json(AdminListScrapedItemsResponse.parse(items));
});

router.post("/admin/scraped-items", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateScrapedItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(scrapedItemsTable).values(parsed.data).returning();

  res.status(201).json(CreateScrapedItemResponse.parse(item));
});

router.post("/admin/scraped-items/run-scraper", requireAdmin, async (req, res): Promise<void> => {
  const candidates = await runScraperOnce();

  const inserted = candidates.length
    ? await db.insert(scrapedItemsTable).values(candidates).returning()
    : [];

  req.log.info({ count: inserted.length }, "Scraper run staged new items");

  res.json(RunScraperResponse.parse(inserted));
});

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `item-${Date.now()}`
  );
}

router.patch("/admin/scraped-items/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const params = ApproveScrapedItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .select()
    .from(scrapedItemsTable)
    .where(eq(scrapedItemsTable.id, params.data.id));

  if (!item) {
    res.status(404).json({ error: "Scraped item not found" });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const slug = `${slugify(item.rawTitle)}-${item.id}`;

  if (item.suggestedType === "job") {
    await db.insert(jobsTable).values({
      title: item.rawTitle,
      organization: "Unknown",
      examName: item.rawTitle,
      postDate: today,
      description: item.rawContent,
      status: "published",
      slug,
    });
  } else if (item.suggestedType === "result") {
    await db.insert(resultsTable).values({
      title: item.rawTitle,
      organization: "Unknown",
      examName: item.rawTitle,
      resultDate: today,
      description: item.rawContent,
      status: "published",
      slug,
    });
  } else {
    await db.insert(admitCardsTable).values({
      title: item.rawTitle,
      organization: "Unknown",
      examName: item.rawTitle,
      examDate: today,
      description: item.rawContent,
      status: "published",
      slug,
    });
  }

  const [updated] = await db
    .update(scrapedItemsTable)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(eq(scrapedItemsTable.id, params.data.id))
    .returning();

  res.json(ApproveScrapedItemResponse.parse(updated));
});

router.patch("/admin/scraped-items/:id/reject", requireAdmin, async (req, res): Promise<void> => {
  const params = RejectScrapedItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [updated] = await db
    .update(scrapedItemsTable)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(eq(scrapedItemsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Scraped item not found" });
    return;
  }

  res.json(RejectScrapedItemResponse.parse(updated));
});

export default router;
