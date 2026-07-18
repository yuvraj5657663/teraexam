import { useState } from "react";
import { useAdminListScrapedItems, useApproveScrapedItem, useRejectScrapedItem, getAdminListScrapedItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminScrapedItems() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const { data, isLoading } = useAdminListScrapedItems({ status: statusFilter });
  // API returns { data: [...], pagination: {...} } but generated types still say array
  const items = (data as any)?.data ?? data ?? [];
  
  const queryClient = useQueryClient();
  const approveMutation = useApproveScrapedItem();
  const rejectMutation = useRejectScrapedItem();
  const { toast } = useToast();

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListScrapedItemsQueryKey() });
    queryClient.invalidateQueries({ queryKey: ['/api/home/summary'] });
  };

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Item approved and published successfully." });
        invalidateList();
      },
      onError: () => {
        toast({ title: "Failed to approve item.", variant: "destructive" });
      }
    });
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Item rejected." });
        invalidateList();
      },
      onError: () => {
        toast({ title: "Failed to reject item.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Review Queue</h1>
          <p className="text-muted-foreground mt-1">Approve scraped items to publish them immediately.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={statusFilter === "pending" ? "default" : "outline"} onClick={() => setStatusFilter("pending")}>
            Pending
          </Button>
          <Button variant={statusFilter === "approved" ? "default" : "outline"} onClick={() => setStatusFilter("approved")}>
            Approved
          </Button>
          <Button variant={statusFilter === "rejected" ? "default" : "outline"} onClick={() => setStatusFilter("rejected")}>
            Rejected
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Queue is empty</h3>
            <p className="text-muted-foreground max-w-md">
              There are no {statusFilter} scraped items to review right now. Run the scraper or check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="flex-1 -mx-4 px-4 pb-12">
          <div className="grid gap-4">
            {items.map((item: any) => (
              <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md border-border/50">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="uppercase font-mono tracking-wider font-semibold text-[10px]">
                            {item.suggestedType.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">ID: {item.id}</span>
                        </div>
                        <h3 className="text-lg font-bold font-serif leading-tight">{item.rawTitle}</h3>
                      </div>
                    </div>
                    
                    {item.rawContent && (
                      <div className="mt-4 bg-muted/30 p-4 rounded-md text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto border border-border/50">
                        {item.rawContent}
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 font-medium">
                        View Source <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-muted-foreground">Scraped: {new Date(item.scrapedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {item.status === 'pending' && (
                    <div className="md:w-48 bg-muted/10 border-t md:border-t-0 md:border-l flex flex-row md:flex-col p-4 gap-2 justify-center">
                      <Button 
                        className="w-full shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white" 
                        onClick={() => handleApprove(item.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" /> Approve
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => handleReject(item.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </div>
                  )}
                  {item.status !== 'pending' && (
                    <div className="md:w-48 bg-muted/10 border-t md:border-t-0 md:border-l flex flex-col p-4 items-center justify-center text-center">
                      <Badge variant={item.status === 'approved' ? 'default' : 'destructive'} className="mb-2">
                        {item.status.toUpperCase()}
                      </Badge>
                      {item.reviewedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
