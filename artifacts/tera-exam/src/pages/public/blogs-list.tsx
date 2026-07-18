import { useState } from "react";
import { Link } from "wouter";
import { useListBlogs } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Calendar, ArrowRight, Clock } from "lucide-react";

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

  const { data: responseData, isLoading } = useListBlogs({ 
    search: search || undefined, 
    category: activeCategory || undefined 
  });

  // API returns { data: Blog[], pagination: {...} } but generated types still say Blog[]
  // Use unknown cast to safely extract either shape
  const raw = responseData as unknown;
  const blogs =
    raw != null && typeof raw === "object" && !Array.isArray(raw) && Array.isArray((raw as Record<string, unknown>)["data"])
      ? ((raw as Record<string, unknown>)["data"] as unknown[])
      : Array.isArray(raw)
        ? (raw as unknown[])
        : [];

  const categories = Array.from(new Set(blogs.map((b: any) => b.category)));

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
      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 border rounded-xl border-dashed bg-muted/20">
          <p className="text-muted-foreground">No articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {blogs.map((post: any) => (
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
                    {post.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : new Date(post.createdAt).toLocaleDateString("en-IN", {
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
