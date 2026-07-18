import { date, index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { publishStatusEnum } from "./enums";

export const resultsTable = pgTable(
  "results",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    organization: text("organization").notNull(),
    examName: text("exam_name").notNull(),
    resultDate: date("result_date", { mode: "string" }).notNull(),
    resultLink: text("result_link"),
    description: text("description"),
    status: publishStatusEnum("status").notNull().default("draft"),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("results_status_idx").on(table.status),
    index("results_result_date_idx").on(table.resultDate),
    index("results_organization_idx").on(table.organization),
  ],
);

export const insertResultSchema = createInsertSchema(resultsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof resultsTable.$inferSelect;
