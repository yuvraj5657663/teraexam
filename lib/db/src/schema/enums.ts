import { pgEnum } from "drizzle-orm/pg-core";

export const publishStatusEnum = pgEnum("publish_status", ["draft", "published"]);
export const scrapedStatusEnum = pgEnum("scraped_status", ["pending", "approved", "rejected"]);
export const scrapedSuggestedTypeEnum = pgEnum("scraped_suggested_type", ["job", "result", "admit_card"]);
