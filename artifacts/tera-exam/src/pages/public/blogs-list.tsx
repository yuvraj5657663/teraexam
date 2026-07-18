import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Calendar, ArrowRight, Clock } from "lucide-react";

// Static blog content — replace with API when blog backend is built
const BLOGS = [
  {
    id: 1,
    title: "How to Prepare for SSC CGL 2026: Complete Strategy Guide",
    excerpt:
      "Cracking SSC CGL requires consistency, the right resources, and continuous mock tests. Here's a week-by-week plan that actually works for Tier-1 and Tier-2.",
    date: "2026-07-10",
    readTime: "5 min read",
    category: "SSC",
    tags: ["SSC CGL", "Strategy", "Tier-1"],
  },
  {
    id: 2,
    title: "UPSC Prelims Last Month Revision: What to Focus On",
    excerpt:
      "The final 30 days are the most critical window in your UPSC prep. Here's exactly what to revise, what to skip, and how to handle CSAT in the last stretch.",
    date: "2026-06-28",
    readTime: "8 min read",
    category: "UPSC",
    tags: ["UPSC", "Prelims", "Revision"],
  },
  {
    id: 3,
    title: "RRB NTPC 2026: Complete Syllabus Breakdown",
    excerpt:
      "Railway NTPC syllabus is vast but predictable. We break down every section — Math, GI, GS — with topic-wise weightage based on previous years.",
    date: "2026-06-15",
    readTime: "6 min read",
    category: "Railways",
    tags: ["RRB NTPC", "Syllabus", "Railways"],
  },
  {
    id: 4,
    title: "Quantitative Aptitude: 10 Shortcuts Every Aspirant Must Know",
    excerpt:
      "Time is the biggest enemy in competitive exams. These 10 mental math shortcuts will cut your quant solving time by 40% — with practice.",
    date: "2026-06-01",
    readTime: "7 min read",
    category: "Exam Prep",
    tags: ["Quant", "Shortcuts", "Math"],
  },
  {
    id: 5,
    title: "IBPS Clerk 2026: Eligibility, Exam Pattern, and How to Apply",
    excerpt:
      "Everything you need to know about IBPS Clerk 2026 — from eligibility criteria and age limits to the full exam pattern and application process.",
    date: "2026-05-20",
    readTime: "4 min read",
    category: "Banking",
    tags: ["IBPS", "Banking", "Eligibility"],
  },
  {
    id: 6,
    title: "Current Affairs for June 2026: Top 50 Questions",
    excerpt:
      "A curated list of the 50 most important current affairs questions from June 2026 — covering national, international, sports, awards, and economy.",
    date: "2026-05-05",
    readTime: "10 min read",
    category: "Current Affairs",
    tags: ["Current Affairs", "GK", "June 2026"],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  SSC: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  UPSC: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Railways: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  Banking: "bg-green-500/10 text-green-700 dark:text-green-400",
  "Exam Prep": "bg-primary/10 text-primary",
  "Current Affairs": "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export default function BlogsList() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(BLOGS.map((b) => b.category)));

  const filtered = BLOGS.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      blog.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !activeCategory || blog.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <BookOpen className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Aspirant Blog Zone</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Expert articles, preparation strategies, and guides to fuel your sarkari exam journey.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          className="pl-12 h-14 text-base rounded-xl shadow-sm border-border/80 bg-background"
          placeholder="Search articles, strategies, exams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search blog articles"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center" role="group" aria-label="Filter by category">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !activeCategory
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border rounded-xl border-dashed bg-muted/20">
          <p className="text-muted-foreground">No articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((post) => (
            <Link key={post.id} href={`/blogs/${post.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60 h-full flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold font-serif group-hover:text-primary transition-colors mb-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-primary font-semibold flex items-center text-sm group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
