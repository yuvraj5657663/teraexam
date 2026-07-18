import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Same static data as blogs-list — sync both when backend is ready
const BLOGS: Record<
  number,
  {
    id: number;
    title: string;
    category: string;
    date: string;
    readTime: string;
    author: string;
    tags: string[];
    content: string;
  }
> = {
  1: {
    id: 1,
    title: "How to Prepare for SSC CGL 2026: Complete Strategy Guide",
    category: "SSC",
    date: "2026-07-10",
    readTime: "5 min read",
    author: "TERA EXAM Editorial",
    tags: ["SSC CGL", "Strategy", "Tier-1"],
    content: `SSC CGL 2026 is one of the most competitive exams in India with over 10 lakh aspirants competing for roughly 4,500 posts. Having a structured strategy is the difference between clearing Tier-1 and failing.

**The Core 4 Subjects**

Tier-1 has four sections: Quantitative Aptitude, English, General Intelligence & Reasoning, and General Awareness. Each carries 50 marks. Your strategy must be section-specific.

**Quantitative Aptitude (Most Important)**

Focus on: Percentages, Profit & Loss, Time & Work, Simple & Compound Interest, Geometry, and Trigonometry. These topics collectively account for 60-70% of questions. Practice at least 50 problems per topic before moving on.

**General Awareness (Highest ROI)**

This section can be mastered in 4-6 weeks if you're consistent. Read The Hindu or Indian Express for 30 minutes daily. Focus on: Current Affairs (last 6 months), History (Polity heavy), Geography, and Science.

**English Language**

Reading Comprehension, Cloze Test, and Sentence Improvement are high-yield. Practice 20 questions daily. Vocabulary doesn't need to be advanced — SSC tests standard usage.

**Reasoning (Easiest Section)**

With practice, this becomes your speed-scoring section. Aim for 40+ correct in 20 minutes. Focus on: Analogy, Series, Coding-Decoding, and Blood Relations.

**Weekly Study Plan**

Weeks 1-4: Build concepts in Quant and English.
Weeks 5-8: Practice topic-wise questions (minimum 100/topic).
Weeks 9-12: Full mock tests, 1 per day minimum.
Last 2 weeks: Revision only. No new topics.

**Mock Tests Are Non-Negotiable**

Take at least 40 full-length mocks before the exam. Analyse every mock — where did you lose time? Which topics need work? The analysis is more important than the score.`,
  },
  2: {
    id: 2,
    title: "UPSC Prelims Last Month Revision: What to Focus On",
    category: "UPSC",
    date: "2026-06-28",
    readTime: "8 min read",
    author: "TERA EXAM Editorial",
    tags: ["UPSC", "Prelims", "Revision"],
    content: `The last 30 days before UPSC Prelims are the most high-stakes period of your preparation. The decisions you make now will determine whether you clear the cutoff.

**Rule 1: Stop learning new things**

This is the hardest rule to follow and the most important. The last month is for revision, not for discovering new topics. If you haven't covered it by now, skip it.

**What to Revise**

Priority 1 — Static GK: Indian Polity (Laxmikant), Modern History, Geography, and Economy. These are predictable and high-yield.

Priority 2 — Current Affairs: Cover the last 12 months systematically. Use a single trusted source — Vision IAS or ForumIAS monthly compilations work well.

Priority 3 — Environment and Ecology: This section has grown consistently. Revise protected areas, biodiversity hotspots, and international conventions.

**CSAT: Don't Ignore It**

CSAT has a 33% qualifying mark. That sounds easy until you're staring at a comprehension passage under time pressure. Take 3-4 CSAT mocks per week in the last month.

**Revision Schedule**

Day 1-7: Polity + Modern History
Day 8-14: Geography + Economy
Day 15-21: Environment + Science & Tech + Current Affairs
Day 22-28: Full revisions + previous year papers
Day 29-30: Light revision only, rest well

**Previous Year Papers**

Solve the last 10 years of UPSC Prelims papers. You will notice patterns — certain topics appear every year. Mark those and ensure you know them cold.`,
  },
  3: {
    id: 3,
    title: "RRB NTPC 2026: Complete Syllabus Breakdown",
    category: "Railways",
    date: "2026-06-15",
    readTime: "6 min read",
    author: "TERA EXAM Editorial",
    tags: ["RRB NTPC", "Syllabus", "Railways"],
    content: `RRB NTPC 2026 will recruit for over 8,000 posts across various non-technical categories in Indian Railways. Understanding the syllabus clearly is your first step.

**CBT Stage 1 (100 Questions, 90 Minutes)**

Mathematics (30 questions): Number System, Decimals, Fractions, LCM & HCF, Ratio & Proportions, Percentages, Mensuration, Time & Work, Time & Distance, Simple & Compound Interest, Profit & Loss, Geometry, Trigonometry, Statistics.

General Intelligence & Reasoning (30 questions): Analogies, Alphabetical Series, Mathematical Operations, Venn Diagrams, Data Interpretation, Puzzle, Coding-Decoding, Relationships.

General Awareness (40 questions): Current Events, Indian Geography, General Science, History, Culture, Indian Polity, Economics, Environmental Sciences.

**CBT Stage 2 (120 Questions, 90 Minutes)**

Mathematics (35 questions): Same topics as Stage 1, higher difficulty.
General Intelligence (35 questions): Same topics, more complex.
General Awareness (50 questions): More current affairs and Railways-specific GK.

**Railways-Specific GK (Important)**

History of Indian Railways, Railway zones and headquarters, Types of trains, Recent Railway Budget highlights. This is unique to RRB exams — don't skip it.

**Preparation Approach**

Give equal time to all three sections. Mathematics is the differentiator — aspirants who master Quant consistently score higher. Target 25+ in Mathematics in Stage 1.`,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  SSC: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  UPSC: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Railways: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  Banking: "bg-green-500/10 text-green-700 dark:text-green-400",
  "Exam Prep": "bg-primary/10 text-primary",
  "Current Affairs": "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export default function BlogDetail() {
  const [, params] = useRoute("/blogs/:id");
  const { toast } = useToast();
  const blogId = Number(params?.id);
  const post = BLOGS[blogId];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard!" });
  };

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-2xl">
        <h1 className="text-3xl font-serif font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">
          This article doesn't exist or may have been removed.
        </p>
        <Button asChild>
          <Link href="/blogs">Back to Blogs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Back */}
      <Link
        href="/blogs"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" /> Back to Blogs
      </Link>

      <article>
        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {post.category}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {new Date(post.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readTime}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            {post.author}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            aria-label="Share article"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" /> Share
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {post.content.split("\n\n").map((paragraph, i) => {
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              return (
                <h2 key={i} className="text-xl font-serif font-bold mt-8 mb-3 text-foreground">
                  {paragraph.replace(/\*\*/g, "")}
                </h2>
              );
            }
            // Bold inline text
            const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className="text-foreground/90 leading-relaxed mb-4">
                {parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j}>{part.replace(/\*\*/g, "")}</strong>
                  ) : (
                    part
                  ),
                )}
              </p>
            );
          })}
        </div>
      </article>

      {/* Back button */}
      <div className="mt-12 pt-8 border-t">
        <Button variant="outline" asChild>
          <Link href="/blogs">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to All Articles
          </Link>
        </Button>
      </div>
    </div>
  );
}
