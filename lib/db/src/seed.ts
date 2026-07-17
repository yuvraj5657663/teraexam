import bcrypt from "bcryptjs";
import { db, pool } from "./index";
import {
  adminsTable,
  jobsTable,
  resultsTable,
  admitCardsTable,
  syllabusTable,
  subjectsTable,
  topicsTable,
  questionsTable,
} from "./schema";

async function seedAdmin(): Promise<void> {
  const password = process.env["ADMIN_SEED_PASSWORD"];
  if (!password) {
    console.log("Skipping admin seed: ADMIN_SEED_PASSWORD is not set.");
    return;
  }

  const existing = await db.select().from(adminsTable).limit(1);
  if (existing.length > 0) {
    console.log("Admin already exists, skipping admin seed.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(adminsTable).values({ username: "admin", passwordHash });
  console.log("Seeded admin user with username 'admin'.");
}

async function seedContent(): Promise<void> {
  const existingJobs = await db.select().from(jobsTable).limit(1);
  if (existingJobs.length > 0) {
    console.log("Content already seeded, skipping.");
    return;
  }

  await db.insert(jobsTable).values([
    {
      title: "Staff Selection Commission — Combined Graduate Level Exam 2026",
      organization: "Staff Selection Commission (SSC)",
      examName: "SSC CGL 2026",
      postDate: "2026-07-01",
      lastDate: "2026-08-05",
      applyLink: "https://ssc.nic.in",
      description: "Recruitment for various Group B and C posts across central government departments.",
      vacancies: 4500,
      category: "Central Government",
      status: "published",
      slug: "ssc-cgl-2026",
    },
    {
      title: "Railway Recruitment Board — Non-Technical Popular Categories",
      organization: "Railway Recruitment Board (RRB)",
      examName: "RRB NTPC 2026",
      postDate: "2026-06-15",
      lastDate: "2026-07-30",
      applyLink: "https://rrbcdg.gov.in",
      description: "Recruitment for various non-technical posts in Indian Railways.",
      vacancies: 8000,
      category: "Railways",
      status: "draft",
      slug: "rrb-ntpc-2026",
    },
  ]);

  await db.insert(resultsTable).values([
    {
      title: "SSC CHSL 2025 Tier-1 Result",
      organization: "Staff Selection Commission (SSC)",
      examName: "SSC CHSL 2025",
      resultDate: "2026-07-05",
      resultLink: "https://ssc.nic.in/results",
      description: "Tier-1 result declared for SSC CHSL 2025 candidates.",
      status: "published",
      slug: "ssc-chsl-2025-tier1-result",
    },
  ]);

  await db.insert(admitCardsTable).values([
    {
      title: "IBPS Clerk 2026 Prelims Admit Card",
      organization: "Institute of Banking Personnel Selection (IBPS)",
      examName: "IBPS Clerk 2026",
      examDate: "2026-08-20",
      admitCardLink: "https://ibps.in/admit-card",
      description: "Download the prelims admit card for IBPS Clerk 2026.",
      status: "published",
      slug: "ibps-clerk-2026-prelims-admit-card",
    },
  ]);

  await db.insert(syllabusTable).values([
    {
      examName: "SSC CGL 2026",
      title: "SSC CGL 2026 Detailed Syllabus",
      pdfUrl: "https://ssc.nic.in/syllabus/cgl-2026.pdf",
      description: "Tier-1 and Tier-2 syllabus breakdown for SSC CGL 2026.",
      status: "published",
    },
  ]);

  const [subject] = await db
    .insert(subjectsTable)
    .values({ name: "Quantitative Aptitude", slug: "quantitative-aptitude", description: "Numerical ability and mathematics for competitive exams." })
    .returning();

  if (subject) {
    const [topic] = await db
      .insert(topicsTable)
      .values({ subjectId: subject.id, name: "Percentages", slug: "percentages" })
      .returning();

    if (topic) {
      await db.insert(questionsTable).values([
        {
          topicId: topic.id,
          questionText: "What is 25% of 200?",
          options: ["25", "50", "75", "100"],
          correctOptionIndex: 1,
          explanation: "25% of 200 = 0.25 × 200 = 50.",
          difficulty: "easy",
        },
        {
          topicId: topic.id,
          questionText: "If 40% of a number is 80, what is the number?",
          options: ["160", "180", "200", "220"],
          correctOptionIndex: 2,
          explanation: "Number = 80 / 0.40 = 200.",
          difficulty: "medium",
        },
        {
          topicId: topic.id,
          questionText: "A price increases from 200 to 250. What is the percentage increase?",
          options: ["20%", "25%", "30%", "50%"],
          correctOptionIndex: 1,
          explanation: "Increase = 50/200 × 100 = 25%.",
          difficulty: "medium",
        },
      ]);
    }
  }

  console.log("Seeded sample content.");
}

async function main(): Promise<void> {
  await seedAdmin();
  await seedContent();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
