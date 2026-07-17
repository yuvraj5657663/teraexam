import { useGetAdminDashboardSummary, useRunScraper } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, CheckSquare, FileKey, BookOpen, Database, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: summary, isLoading, refetch } = useGetAdminDashboardSummary();
  const runScraper = useRunScraper();
  const { toast } = useToast();

  const handleRunScraper = () => {
    runScraper.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Scraper task triggered successfully." });
        refetch();
      },
      onError: () => {
        toast({ title: "Failed to trigger scraper.", variant: "destructive" });
      }
    });
  };

  const statCards = [
    { title: "Review Queue", value: summary?.pendingScrapedItems ?? 0, icon: Inbox, color: "text-amber-500", link: "/admin/scraped-items", urgent: (summary?.pendingScrapedItems ?? 0) > 0 },
    { title: "Jobs", value: summary?.totalJobs ?? 0, icon: FileText, color: "text-blue-500", link: "/admin/jobs" },
    { title: "Results", value: summary?.totalResults ?? 0, icon: CheckSquare, color: "text-green-500", link: "/admin/results" },
    { title: "Admit Cards", value: summary?.totalAdmitCards ?? 0, icon: FileKey, color: "text-purple-500", link: "/admin/admit-cards" },
    { title: "Syllabus PDFs", value: summary?.totalSyllabus ?? 0, icon: BookOpen, color: "text-rose-500", link: "/admin/syllabus" },
    { title: "Questions", value: summary?.totalQuestions ?? 0, icon: Database, color: "text-slate-500", link: "/admin/exam-prep" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and statistics</p>
        </div>
        <Button 
          onClick={handleRunScraper} 
          disabled={runScraper.isPending}
          variant="outline"
          className="shadow-sm border-primary/20 text-primary hover:bg-primary/5"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${runScraper.isPending ? 'animate-spin' : ''}`} />
          {runScraper.isPending ? 'Running Scraper...' : 'Run Scraper Now'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, i) => (
            <Link key={i} href={stat.link}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group hover:shadow-md relative overflow-hidden">
                {stat.urgent && (
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-2 m-4 bg-primary rounded-full animate-ping" />
                    <div className="absolute top-0 right-0 w-2 h-2 m-4 bg-primary rounded-full" />
                  </div>
                )}
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md bg-muted group-hover:bg-background transition-colors ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold font-mono ${stat.urgent ? 'text-primary' : ''}`}>
                    {stat.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
