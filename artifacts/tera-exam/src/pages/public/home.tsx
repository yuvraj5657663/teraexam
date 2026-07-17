import { useGetHomeSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, FileText, CheckSquare, FileKey, BookOpen, AlertCircle, Calendar, Database } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Home() {
  const { data: summary, isLoading } = useGetHomeSummary();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Marquee Ticker */}
      {summary?.tickerItems && summary.tickerItems.length > 0 && (
        <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden flex items-center relative z-10 border-b border-primary-foreground/20">
          <div className="container mx-auto px-4 flex items-center">
            <span className="font-bold flex items-center gap-2 mr-6 shrink-0 bg-primary z-20 text-sm uppercase tracking-wider shadow-[10px_0_10px_-5px_hsl(var(--primary))]">
              <AlertCircle className="h-4 w-4" /> Live Updates
            </span>
            <div className="flex-1 overflow-hidden relative">
              <div className="flex whitespace-nowrap animate-in slide-in-from-right-full duration-[30s] repeat-infinite linear text-sm font-medium">
                {summary.tickerItems.map((item, idx) => (
                  <span key={item.id} className="mx-8 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-none">
                      {item.type.replace('_', ' ')}
                    </Badge>
                    {item.link ? (
                      <Link href={item.link} className="hover:underline hover:text-white transition-colors">{item.title}</Link>
                    ) : (
                      item.title
                    )}
                    {idx < summary.tickerItems.length - 1 && <span className="ml-8 opacity-50">•</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-background py-16 md:py-24 border-b relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="outline" className="mb-6 py-1 px-4 text-sm font-medium tracking-wide uppercase border-primary/30 text-primary bg-primary/5">
            India's Most Trusted Sarkari Exam Portal
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-[1.1]">
            Fastest Updates for <span className="text-primary">Government Jobs</span> & Exams.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Never miss a deadline. Get verified notifications for jobs, results, admit cards, and prepare with our structured MCQ banks.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold shadow-lg shadow-primary/20" asChild>
              <Link href="/jobs">Browse Latest Jobs</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-background" asChild>
              <Link href="/exam-prep">Start Exam Practice</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-16 container mx-auto px-4">
        <Tabs defaultValue="jobs" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-muted/50 rounded-xl mb-8">
            <TabsTrigger value="jobs" className="text-base font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Latest Jobs</TabsTrigger>
            <TabsTrigger value="results" className="text-base font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Results</TabsTrigger>
            <TabsTrigger value="admit-cards" className="text-base font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Admit Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4 animate-in fade-in-50 duration-500">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : summary?.latestJobs?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">No jobs published recently.</div>
            ) : (
              <div className="grid gap-4">
                {summary?.latestJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60">
                      <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">{job.organization}</Badge>
                            {job.vacancies && <Badge variant="outline" className="font-medium">{job.vacancies} Posts</Badge>}
                          </div>
                          <h3 className="text-xl font-bold font-serif group-hover:text-primary transition-colors">{job.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1">{job.examName}</p>
                        </div>
                        <div className="flex flex-col md:items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                          <div className="text-sm font-medium flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" /> Last Date: {formatDate(job.lastDate)}
                          </div>
                          <span className="text-primary text-sm font-semibold flex items-center mt-2 md:mt-0 group-hover:translate-x-1 transition-transform">
                            View Details <ArrowRight className="ml-1 h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-8 text-center">
              <Button variant="ghost" className="font-semibold" asChild>
                <Link href="/jobs">View All Jobs <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4 animate-in fade-in-50 duration-500">
            <div className="grid gap-4">
              {summary?.latestResults.map((item) => (
                <Link key={item.id} href={`/results/${item.id}`}>
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 font-medium">Result Declared</Badge>
                          <span className="text-xs font-mono text-muted-foreground uppercase">{item.organization}</span>
                        </div>
                        <h3 className="text-xl font-bold font-serif group-hover:text-primary transition-colors">{item.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 md:flex-col md:items-end shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                        <div className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                           {formatDate(item.resultDate)}
                        </div>
                        <span className="text-primary text-sm font-semibold flex items-center mt-2 md:mt-0 group-hover:translate-x-1 transition-transform">
                          Check Result <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="ghost" className="font-semibold" asChild>
                <Link href="/results">View All Results <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="admit-cards" className="space-y-4 animate-in fade-in-50 duration-500">
             <div className="grid gap-4">
              {summary?.latestAdmitCards.map((item) => (
                <Link key={item.id} href={`/admit-cards/${item.id}`}>
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 font-medium">Admit Card Out</Badge>
                          <span className="text-xs font-mono text-muted-foreground uppercase">{item.organization}</span>
                        </div>
                        <h3 className="text-xl font-bold font-serif group-hover:text-primary transition-colors">{item.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 md:flex-col md:items-end shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                        <div className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                           Exam: {formatDate(item.examDate)}
                        </div>
                        <span className="text-primary text-sm font-semibold flex items-center mt-2 md:mt-0 group-hover:translate-x-1 transition-transform">
                          Download <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="ghost" className="font-semibold" asChild>
                <Link href="/admit-cards">View All Admit Cards <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Quick Links / Featured Sections */}
      <section className="py-16 bg-muted/30 border-t mt-auto">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-background border-border shadow-sm">
              <CardContent className="p-8 flex flex-col h-full">
                <BookOpen className="h-10 w-10 text-primary mb-6" />
                <h3 className="text-2xl font-serif font-bold mb-3">Official Syllabus PDFs</h3>
                <p className="text-muted-foreground mb-8 flex-1">
                  Don't rely on unverified sources. Download exact syllabus PDFs for SSC, UPSC, Banking, and Railway exams straight from our verified library.
                </p>
                <Button variant="outline" className="w-full sm:w-auto self-start" asChild>
                  <Link href="/syllabus">Browse Syllabus</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-primary text-primary-foreground border-transparent shadow-md">
              <CardContent className="p-8 flex flex-col h-full">
                <Database className="h-10 w-10 text-primary-foreground/80 mb-6" />
                <h3 className="text-2xl font-serif font-bold mb-3">Exam Prep Zone</h3>
                <p className="text-primary-foreground/80 mb-8 flex-1">
                  Focused, rigorous MCQ practice sessions. Test your knowledge across History, Quant, Reasoning, and Polity with detailed explanations.
                </p>
                <Button className="w-full sm:w-auto self-start bg-background text-foreground hover:bg-background/90" asChild>
                  <Link href="/exam-prep">Start Practice Session</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
