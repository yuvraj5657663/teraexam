import { useListJobs } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Briefcase, Building, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function JobsList() {
  const [search, setSearch] = useState("");
  const { data: jobs, isLoading } = useListJobs({ search: search || undefined });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Latest Govt Jobs</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse verified recruitment notifications across SSC, UPSC, Banking, Railways, and State PSCs.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          className="pl-12 h-14 text-base rounded-xl shadow-sm border-border/80 bg-background"
          placeholder="Search by exam name, organization, or job title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading jobs...</div>
      ) : jobs?.length === 0 ? (
        <div className="text-center py-20 border rounded-xl border-dashed bg-muted/20">
          <Briefcase className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No jobs found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs?.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
                        <Building className="h-3 w-3 mr-1.5" />
                        {job.organization}
                      </Badge>
                      {job.category && <Badge variant="outline" className="bg-background">{job.category}</Badge>}
                      {job.vacancies && <Badge variant="outline" className="bg-muted/50">{job.vacancies} Posts</Badge>}
                    </div>
                    <h2 className="text-2xl font-bold font-serif group-hover:text-primary transition-colors leading-tight mb-2">
                      {job.title}
                    </h2>
                    <p className="text-muted-foreground font-medium">{job.examName}</p>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-3 shrink-0 bg-muted/30 p-4 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
                    <div className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <span className="w-16 text-muted-foreground text-xs uppercase tracking-wider font-mono">POSTED</span>
                      {formatDate(job.postDate)}
                    </div>
                    <div className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <span className="w-16 text-muted-foreground text-xs uppercase tracking-wider font-mono">LAST DT</span>
                      <span className="text-destructive font-semibold">{formatDate(job.lastDate)}</span>
                    </div>
                    <div className="mt-2 md:mt-4 text-primary font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                      View full details <ArrowRight className="ml-1.5 h-4 w-4" />
                    </div>
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
