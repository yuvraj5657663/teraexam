import { date, index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { publishStatusEnum } from "./enums";

export const admitCardsTable = pgTable(
  "admit_cards",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    organization: text("organization").notNull(),
    examName: text("exam_name").notNull(),
    examDate: date("exam_date", { mode: "string" }).notNull(),
    admitCardLink: text("admit_card_link"),
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
    index("admit_cards_status_idx").on(table.status),
    index("admit_cards_exam_date_idx").on(table.examDate),
    index("admit_cards_organization_idx").on(table.organization),
  ],
);

export const insertAdmitCardSchema = createInsertSchema(admitCardsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAdmitCard = z.infer<typeof insertAdmitCardSchema>;
export type AdmitCard = typeof admitCardsTable.$inferSelect;
