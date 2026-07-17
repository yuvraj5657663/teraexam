import { useGetJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Calendar, ExternalLink, Briefcase, FileText, Share2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: job, isLoading, isError } = useGetJob(id, { query: { enabled: !!id, queryKey: getGetJobQueryKey(id) } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <Skeleton className="h-10 w-24 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Job Not Found</h1>
        <p className="text-muted-foreground mb-8">The notification you are looking for does not exist or has been removed.</p>
        <Button asChild><Link href="/jobs">Return to Jobs List</Link></Button>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-background border-b pt-12 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Jobs
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent text-sm py-1">
              <Building className="h-3.5 w-3.5 mr-1.5" />
              {job.organization}
            </Badge>
            {job.category && <Badge variant="outline" className="text-sm py-1">{job.category}</Badge>}
            <Badge variant="outline" className="bg-muted text-sm py-1 font-mono uppercase tracking-wider">
              {job.slug}
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-foreground leading-[1.15] mb-6">
            {job.title}
          </h1>
          
          <div className="text-xl text-muted-foreground font-medium">
            {job.examName}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-10">
        {/* Info Grid */}
        <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Post Date</span>
            <div className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {formatDate(job.postDate)}
            </div>
          </div>
          <div className="space-y-1 border-l pl-6 border-border/50">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Last Date</span>
            <div className="font-semibold text-destructive flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(job.lastDate)}
            </div>
          </div>
          <div className="space-y-1 border-t md:border-t-0 pt-6 md:pt-0 md:border-l pl-0 md:pl-6 col-span-2 md:col-span-1 border-border/50">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Vacancies</span>
            <div className="font-semibold flex items-center gap-2 text-lg">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              {job.vacancies ? job.vacancies.toLocaleString() : "Not Specified"}
            </div>
          </div>
          <div className="space-y-1 border-t md:border-t-0 pt-6 md:pt-0 md:border-l pl-0 md:pl-6 col-span-2 md:col-span-1 border-border/50">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Status</span>
            <div className="font-semibold text-emerald-600 flex items-center gap-2">
              Active
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card border rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 border-b pb-4">
                <FileText className="h-5 w-5 text-primary" /> Details & Description
              </h3>
              {job.description ? (
                <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-serif">
                  {/* Since description is plain text from API, we'll format it simply. 
                      If it contained markdown, we'd render it via a markdown component. */}
                  {job.description.split('\n').map((paragraph, idx) => (
                    paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No additional details provided for this notification. Please refer to the official linked document.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-serif font-bold text-lg mb-4">Important Links</h3>
              <div className="space-y-4">
                {job.applyLink ? (
                  <Button className="w-full h-12 text-base font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                      Apply Online <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button className="w-full h-12 text-base" disabled variant="secondary">
                    Apply Link Not Available
                  </Button>
                )}
                
                <Button variant="outline" className="w-full" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // Optional: trigger toast
                }}>
                  <Share2 className="mr-2 h-4 w-4" /> Share this Job
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Always verify details with the official organization website before applying. TERA EXAM is an information aggregator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
