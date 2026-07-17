import { logger } from "./logger";

export interface ScrapedCandidate {
  sourceUrl: string;
  suggestedType: "job" | "result" | "admit_card";
  rawTitle: string;
  rawContent: string | null;
}

/**
 * Stub scraper service. Real Puppeteer-based scraping against target Sarkari
 * exam sites will replace this once the target sites are decided. For now
 * this simulates a scraper run by returning a small set of plausible
 * candidates so the staging/approve-reject pipeline can be exercised end to
 * end without a live network dependency.
 */
export async function runScraperOnce(): Promise<ScrapedCandidate[]> {
  logger.info("Running stub scraper");

  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace("T", " ");

  return [
    {
      sourceUrl: "https://example-sarkari-source.gov.in/notifications",
      suggestedType: "job",
      rawTitle: `Staff Selection Commission — New Recruitment Notice (${stamp})`,
      rawContent:
        "Scraped placeholder content. Replace runScraperOnce() in src/lib/scraper.ts with a real Puppeteer crawl once target sites are confirmed.",
    },
  ];
}
