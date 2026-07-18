import { date, index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { publishStatusEnum } from "./enums";

export const blogsTable = pgTable(
  "blogs",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(),
    tags: text("tags").array().notNull().default([]),
    author: text("author").notNull().default("TERA EXAM Editorial"),
    readTime: text("read_time").notNull(),
    publishedAt: date("published_at", { mode: "string" }),
    status: publishStatusEnum("status").notNull().default("draft"),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("blogs_status_idx").on(table.status),
    index("blogs_category_idx").on(table.category),
    index("blogs_published_at_idx").on(table.publishedAt),
  ],
);

export const insertBlogSchema = createInsertSchema(blogsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = typeof blogsTable.$inferSelect;