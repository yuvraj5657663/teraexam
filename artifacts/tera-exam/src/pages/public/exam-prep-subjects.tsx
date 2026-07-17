import { useListSubjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Database, BrainCircuit, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExamPrepSubjects() {
  const { data: subjects, isLoading } = useListSubjects();

  // Pick an icon based on ID for visual variety
  const getIcon = (id: number) => {
    const icons = [Database, BrainCircuit, GraduationCap, BookOpen];
    const IconComponent = icons[id % icons.length];
    return <IconComponent className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Exam Prep Zone</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Rigorous MCQ practice sessions designed for serious aspirants. Select a subject to begin.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : subjects?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-xl border-dashed">
          No subjects available yet. Check back later.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects?.map((sub) => (
            <Link key={sub.id} href={`/exam-prep/${sub.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer border-border/60 h-full">
                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {getIcon(sub.id)}
                  </div>
                  <h3 className="text-xl font-bold font-serif group-hover:text-primary transition-colors mb-2">{sub.name}</h3>
                  {sub.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{sub.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
