import { useGetResult, getGetResultQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Calendar, ExternalLink, FileText, Trophy, Info } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResultDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: result, isLoading, isError } = useGetResult(id, { query: { enabled: !!id, queryKey: getGetResultQueryKey(id) } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        <Skeleton className="h-10 w-24 mb-8" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-32 w-full mt-8" />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Result Not Found</h1>
        <p className="text-muted-foreground mb-8">The result notification does not exist or has been removed.</p>
        <Button asChild><Link href="/results">Return to Results</Link></Button>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-[calc(100vh-4rem)] pb-20">
      <div className="bg-background border-b pt-12 pb-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Link href="/results" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 absolute left-8 top-24">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-foreground leading-[1.15] mb-4 mx-auto max-w-2xl">
            {result.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Badge variant="outline" className="text-sm py-1 font-normal bg-background">
              <Building className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              {result.organization}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 font-normal bg-background">
              {result.examName}
            </Badge>
          </div>
          
          <div className="text-muted-foreground flex items-center justify-center gap-2 font-medium">
            <Calendar className="h-4 w-4" /> Declared on: {formatDate(result.resultDate)}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl mt-8">
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 border-b">
            <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Notification Details
            </h3>
            {result.description ? (
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
                {result.description.split('\n').map((paragraph: any, idx: any) => (
                  paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Official result declaration notification.</p>
            )}
          </div>
          
          <div className="bg-muted/30 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-1">Official Result Link</h4>
              <p className="text-sm text-muted-foreground">Click the button to view your result, cut-off marks, or merit list on the official portal.</p>
            </div>
            
            {result.resultLink ? (
              <Button size="lg" className="w-full sm:w-auto shrink-0 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                <a href={result.resultLink} target="_blank" rel="noopener noreferrer">
                  Check Result <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button size="lg" disabled variant="secondary" className="w-full sm:w-auto shrink-0">
                Link Not Provided
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
