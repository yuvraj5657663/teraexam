import { useListSyllabus } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Download, FileText } from "lucide-react";

export default function SyllabusList() {
  const [search, setSearch] = useState("");
  const { data: syllabus, isLoading } = useListSyllabus({ search: search || undefined });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Official Syllabus PDFs</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Download the exact, verified syllabus documents to guide your exam preparation.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          className="pl-12 h-14 text-base rounded-xl shadow-sm border-border/80 bg-background"
          placeholder="Search for an exam syllabus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading syllabus database...</div>
      ) : syllabus?.length === 0 ? (
        <div className="text-center py-20 border rounded-xl border-dashed bg-muted/20">
          <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No documents found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {syllabus?.map((item) => (
            <Card key={item.id} className="hover:border-primary/40 transition-colors group border-border/60">
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-12 w-12 bg-rose-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-serif text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{item.examName}</p>
                </div>
                <div className="shrink-0 mt-4 sm:mt-0">
                  <Button className="w-full sm:w-auto font-semibold bg-background border-2 hover:bg-muted text-foreground shadow-none" asChild>
                    <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" /> PDF
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
