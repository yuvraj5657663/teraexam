import { useListJobs } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Briefcase, Building, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

function JobCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="space-y-2 shrink-0 md:w-40">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-24 mt-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobsList() {
  const [search, setSearch] = useState("");
  const { data: responseData, isLoading } = useListJobs({ search: search || undefined });

  // API now returns { data: Job[], pagination: {...} } but generated types still say Job[]
  // Use unknown cast to safely extract either shape
  const raw = responseData as unknown;
  const jobs =
    raw != null && typeof raw === "object" && !Array.isArray(raw) && Array.isArray((raw as Record<string, unknown>)["data"])
      ? ((raw as Record<string, unknown>)["data"] as unknown[])
      : Array.isArray(raw)
        ? (raw as unknown[])
        : [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Page header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
          Latest Govt Jobs
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Verified recruitment notifications across SSC, UPSC, Banking, Railways, and State PSCs.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl mx-auto mb-12">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          className="pl-12 h-14 text-base rounded-xl shadow-sm border-border/80 bg-background"
          placeholder="Search by exam name, organization, or job title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search jobs"
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading jobs">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 border rounded-xl border-dashed bg-muted/20">
          <Briefcase className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-lg font-medium text-foreground mb-1">No jobs found</h2>
          <p className="text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="space-y-4" role="list" aria-label="Job listings">
          {(jobs as Array<{
            id: number;
            organization: string;
            vacancies?: number | null;
            title: string;
            examName: string;
            postDate: Date | string | null;
            lastDate?: Date | string | null;
            category?: string | null;
            slug: string;
          }>).map((job) => (
            <div key={job.id} role="listitem">
              <Link href={`/jobs/${job.id}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60">
                  <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                        >
                          <Building className="h-3 w-3 mr-1.5" aria-hidden="true" />
                          {job.organization}
                        </Badge>
                        {job.category && (
                          <Badge variant="outline" className="bg-background">
                            {job.category}
                          </Badge>
                        )}
                        {job.vacancies && (
                          <Badge variant="outline" className="bg-muted/50">
                            {job.vacancies.toLocaleString("en-IN")} Posts
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold font-serif group-hover:text-primary transition-colors leading-tight mb-2">
                        {job.title}
                      </h2>
                      <p className="text-muted-foreground font-medium">{job.examName}</p>
                    </div>

                    <div className="flex flex-col md:items-end gap-2.5 shrink-0 bg-muted/30 p-4 rounded-lg md:bg-transparent md:p-0 md:rounded-none md:min-w-[160px]">
                      <div className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-mono">
                          Posted
                        </span>
                        {formatDate(job.postDate)}
                      </div>
                      <div className="text-sm font-semibold flex items-center gap-2 text-destructive">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-mono">
                          Last dt
                        </span>
                        {formatDate(job.lastDate)}
                      </div>
                      <div className="mt-2 text-primary font-semibold flex items-center text-sm group-hover:translate-x-1 transition-transform">
                        View details{" "}
                        <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
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
