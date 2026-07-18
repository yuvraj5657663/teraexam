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

router.get("/admin/scraped-items", requireAdmin, async (req, res, next): Promise<void> => {
  try {
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
  } catch (err) {
    next(err);
  }
});

router.post("/admin/scraped-items", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateScrapedItemBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const [item] = await db.insert(scrapedItemsTable).values(parsed.data).returning();
    res.status(201).json(CreateScrapedItemResponse.parse(item));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/scraped-items/run-scraper", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const candidates = await runScraperOnce();

    const inserted = candidates.length
      ? await db.insert(scrapedItemsTable).values(candidates).returning()
      : [];

    req.log.info({ count: inserted.length }, "Scraper run staged new items");
    res.json(RunScraperResponse.parse(inserted));
  } catch (err) {
    next(err);
  }
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

router.patch("/admin/scraped-items/:id/approve", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = ApproveScrapedItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid item ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [item] = await db
      .select()
      .from(scrapedItemsTable)
      .where(eq(scrapedItemsTable.id, params.data.id));

    if (!item) {
      res.status(404).json({ error: "Scraped item not found", code: "NOT_FOUND" });
      return;
    }

    if (item.status !== "pending") {
      res.status(409).json({ error: "Item has already been reviewed", code: "CONFLICT" });
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
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/scraped-items/:id/reject", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = RejectScrapedItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid item ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [updated] = await db
      .update(scrapedItemsTable)
      .set({ status: "rejected", reviewedAt: new Date() })
      .where(eq(scrapedItemsTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Scraped item not found", code: "NOT_FOUND" });
      return;
    }

    res.json(RejectScrapedItemResponse.parse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
