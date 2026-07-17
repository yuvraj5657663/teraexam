import { useListAdmitCards } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileKey, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdmitCardsList() {
  const [search, setSearch] = useState("");
  const { data: cards, isLoading } = useListAdmitCards({ search: search || undefined });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Admit Cards & Hall Tickets</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Download your exam call letters. Don't forget to print them before the exam date.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          className="pl-12 h-14 text-base rounded-xl shadow-sm border-border/80 bg-background"
          placeholder="Search by exam name or organization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading admit cards...</div>
      ) : cards?.length === 0 ? (
        <div className="text-center py-20 border rounded-xl border-dashed bg-muted/20">
          <FileKey className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No admit cards found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards?.map((item) => (
            <Link key={item.id} href={`/admit-cards/${item.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 font-medium">
                      Available Now
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider bg-muted px-2 py-1 rounded">{item.organization}</span>
                  </div>
                  
                  <h2 className="text-xl font-bold font-serif group-hover:text-primary transition-colors leading-snug mb-2">
                    {item.title}
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium mb-6 flex-1">{item.examName}</p>
                  
                  <div className="bg-muted/30 -mx-6 -mb-6 p-4 px-6 border-t border-border/50 flex items-center justify-between mt-auto">
                    <div className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <Calendar className="h-4 w-4 text-primary" /> 
                      <span className="text-muted-foreground font-normal mr-1">Exam:</span>
                      {formatDate(item.examDate)}
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
