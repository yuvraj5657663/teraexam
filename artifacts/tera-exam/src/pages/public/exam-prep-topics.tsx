import { useListTopicsBySubject, useListSubjects, getListTopicsBySubjectQueryKey } from "@workspace/api-client-react";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ExamPrepTopics() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId || "0", 10);
  
  const { data: topics, isLoading } = useListTopicsBySubject(subjectId, { query: { enabled: !!subjectId, queryKey: getListTopicsBySubjectQueryKey(subjectId) } });
  const { data: subjects } = useListSubjects();
  
  const subject = subjects?.find(s => s.id === subjectId);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/exam-prep" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Subjects
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
          {subject?.name || "Topics"}
        </h1>
        <p className="text-muted-foreground">Select a topic to start your practice session.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : topics?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-xl border-dashed">
          No topics available for this subject yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {topics?.map((topic) => (
            <Link key={topic.id} href={`/exam-prep/${subjectId}/${topic.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold font-serif group-hover:text-primary transition-colors">{topic.name}</h3>
                  </div>
                  <Button variant="ghost" className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Start <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
