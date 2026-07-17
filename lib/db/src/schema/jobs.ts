import { date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { publishStatusEnum } from "./enums";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  examName: text("exam_name").notNull(),
  postDate: date("post_date", { mode: "string" }).notNull(),
  lastDate: date("last_date", { mode: "string" }),
  applyLink: text("apply_link"),
  description: text("description"),
  vacancies: integer("vacancies"),
  category: text("category"),
  status: publishStatusEnum("status").notNull().default("draft"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
