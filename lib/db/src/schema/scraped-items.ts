import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { scrapedStatusEnum, scrapedSuggestedTypeEnum } from "./enums";

export const scrapedItemsTable = pgTable(
  "scraped_items",
  {
    id: serial("id").primaryKey(),
    sourceUrl: text("source_url").notNull(),
    suggestedType: scrapedSuggestedTypeEnum("suggested_type").notNull(),
    rawTitle: text("raw_title").notNull(),
    rawContent: text("raw_content"),
    status: scrapedStatusEnum("status").notNull().default("pending"),
    scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
  (table) => [
    index("scraped_items_status_idx").on(table.status),
    index("scraped_items_scraped_at_idx").on(table.scrapedAt),
  ],
);

export const insertScrapedItemSchema = createInsertSchema(scrapedItemsTable).omit({
  id: true,
  scrapedAt: true,
  reviewedAt: true,
});
export type InsertScrapedItem = z.infer<typeof insertScrapedItemSchema>;
export type ScrapedItem = typeof scrapedItemsTable.$inferSelect;
