import { useListResults } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Trophy, CheckCircle, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

function ResultCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-6 flex flex-col h-full gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResultsList() {
  const [search, setSearch] = useState("");
  const { data: responseData, isLoading } = useListResults({ search: search || undefined });

  const raw = responseData as unknown;
  const results =
    raw != null && typeof raw === "object" && !Array.isArray(raw) && Array.isArray((raw as Record<string, unknown>)["data"])
      ? ((raw as Record<string, unknown>)["data"] as unknown[])
      : Array.isArray(raw)
        ? (raw as unknown[])
        : [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
          Exam Results
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track newly declared results, cut-offs, and merit lists across all major exams.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          className="pl-12 h-14 text-base rounded-xl shadow-sm border-border/80 bg-background"
          placeholder="Search by exam name or organization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search results"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading results">
          {Array.from({ length: 4 }).map((_, i) => (
            <ResultCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 border rounded-xl border-dashed bg-muted/20">
          <Trophy
            className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4"
            aria-hidden="true"
          />
          <h2 className="text-lg font-medium text-foreground mb-1">No results found</h2>
          <p className="text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2" role="list" aria-label="Result listings">
          {(results as Array<{
            id: number;
            organization: string;
            title: string;
            examName: string;
            resultDate: Date | string | null;
            resultLink?: string | null;
            slug: string;
          }>).map((item) => (
            <div key={item.id} role="listitem">
              <Link href={`/results/${item.id}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                      >
                        <CheckCircle className="h-3 w-3 mr-1.5" aria-hidden="true" />
                        Result Declared
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        {item.organization}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold font-serif group-hover:text-primary transition-colors leading-snug mb-2">
                      {item.title}
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mb-6 flex-1">
                      {item.examName}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="text-sm font-medium text-muted-foreground">
                        {formatDate(item.resultDate)}
                      </div>
                      <div className="text-primary font-semibold flex items-center text-sm group-hover:translate-x-1 transition-transform">
                        Check Status{" "}
                        <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
