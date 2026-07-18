import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { publishStatusEnum } from "./enums";

export const syllabusTable = pgTable(
  "syllabus",
  {
    id: serial("id").primaryKey(),
    examName: text("exam_name").notNull(),
    title: text("title").notNull(),
    pdfUrl: text("pdf_url").notNull(),
    description: text("description"),
    status: publishStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("syllabus_status_idx").on(table.status),
    index("syllabus_exam_name_idx").on(table.examName),
  ],
);

export const insertSyllabusSchema = createInsertSchema(syllabusTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSyllabus = z.infer<typeof insertSyllabusSchema>;
export type Syllabus = typeof syllabusTable.$inferSelect;
