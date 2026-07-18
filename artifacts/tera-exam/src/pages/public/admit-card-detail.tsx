import { useGetAdmitCard, getGetAdmitCardQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Calendar, ExternalLink, Info, FileKey, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AdmitCardDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: item, isLoading, isError } = useGetAdmitCard(id, { query: { enabled: !!id, queryKey: getGetAdmitCardQueryKey(id) } });

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

  if (isError || !item) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Not Found</h1>
        <p className="text-muted-foreground mb-8">The admit card notification does not exist or has been removed.</p>
        <Button asChild><Link href="/admit-cards">Return to List</Link></Button>
      </div>
    );
  }

  return (
    <div className="bg-muted/5 min-h-[calc(100vh-4rem)] pb-20">
      <div className="container mx-auto px-4 max-w-3xl pt-12">
        <Link href="/admit-cards" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Link>
        
        <Card className="border-border shadow-md overflow-hidden">
          <div className="bg-primary/5 border-b p-8 md:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <FileKey className="w-32 h-32" />
            </div>
            
            <Badge className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 border-transparent mb-6 text-sm py-1">
              Admit Card Download Available
            </Badge>
            
            <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-foreground leading-[1.2] mb-4 mx-auto max-w-2xl relative z-10">
              {item.title}
            </h1>
            
            <div className="text-lg text-muted-foreground font-medium mb-8 relative z-10">
              {item.examName}
            </div>
            
            <div className="inline-flex bg-background border rounded-lg p-1 shadow-sm relative z-10">
              <div className="px-4 py-2 border-r flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{item.organization}</span>
              </div>
              <div className="px-4 py-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Exam Date:</span>
                <span className="font-bold">{formatDate(item.examDate)}</span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-0">
            {item.description && (
              <div className="p-8 border-b bg-background">
                <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" /> Instructions & Details
                </h3>
                <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground text-sm">
                  {item.description.split('\n').map((paragraph: string, idx: number) => (
                    paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-8 md:p-12 text-center bg-background">
              <div className="max-w-sm mx-auto">
                <Printer className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
                <h4 className="font-bold text-xl mb-2">Download Hall Ticket</h4>
                <p className="text-muted-foreground text-sm mb-8">
                  Keep your registration number and password/DOB handy to log in and download your admit card.
                </p>
                
                {item.admitCardLink ? (
                  <Button size="lg" className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20" asChild>
                    <a href={item.admitCardLink} target="_blank" rel="noopener noreferrer">
                      Download from Official Website <ExternalLink className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" disabled variant="secondary" className="w-full h-14 text-base">
                    Link Not Available Yet
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
