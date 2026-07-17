import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { topicsTable } from "./topics";

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topicsTable.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  options: text("options").array().notNull(),
  correctOptionIndex: integer("correct_option_index").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
