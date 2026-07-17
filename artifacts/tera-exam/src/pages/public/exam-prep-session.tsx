import { useState, useEffect } from "react";
import { useListQuestionsByTopic, useSubmitTopicAnswers, useListTopicsBySubject, getListQuestionsByTopicQueryKey, getListTopicsBySubjectQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExamPrepSession() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId || "0", 10);
  const topicId = parseInt(params.topicId || "0", 10);

  const { data: questions = [], isLoading } = useListQuestionsByTopic(topicId, { query: { enabled: !!topicId, queryKey: getListQuestionsByTopicQueryKey(topicId) } });
  const { data: topics } = useListTopicsBySubject(subjectId, { query: { enabled: !!subjectId, queryKey: getListTopicsBySubjectQueryKey(subjectId) } });
  const submitAnswers = useSubmitTopicAnswers();

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<any>(null);

  const topic = topics?.find(t => t.id === topicId);

  // Initialize timer
  useEffect(() => {
    if (questions.length > 0 && !isStarted) {
      // 1 minute per question
      setTimeLeft(questions.length * 60);
    }
  }, [questions, isStarted]);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && !isFinished && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isStarted && !isFinished) {
      handleSubmit(); // Auto-submit when time is up
    }
    return () => clearTimeout(timer);
  }, [isStarted, isFinished, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (isFinished) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    setIsFinished(true);
    const answersPayload = Object.entries(answers).map(([qId, selectedOpt]) => ({
      questionId: parseInt(qId, 10),
      selectedOption: selectedOpt
    }));
    
    // Fill in unanswered with -1
    questions.forEach(q => {
      if (answers[q.id] === undefined) {
        answersPayload.push({ questionId: q.id, selectedOption: -1 });
      }
    });

    submitAnswers.mutate({ id: topicId, data: { answers: answersPayload } }, {
      onSuccess: (data) => {
        setResults(data);
      }
    });
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-20 text-center"><Skeleton className="h-64 w-full max-w-2xl mx-auto" /></div>;
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
        <p className="text-muted-foreground mb-8">This topic doesn't have any practice questions yet.</p>
        <Button asChild><Link href={`/exam-prep/${subjectId}`}>Back to Topics</Link></Button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href={`/exam-prep/${subjectId}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Topics
        </Link>
        <Card className="border-border shadow-md">
          <CardContent className="p-8 md:p-12 text-center">
            <h1 className="text-3xl font-serif font-bold mb-2">{topic?.name}</h1>
            <p className="text-muted-foreground mb-8">Practice Session</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10">
              <div className="bg-muted/50 p-4 rounded-xl">
                <div className="text-2xl font-bold">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl">
                <div className="text-2xl font-bold">{formatTime(questions.length * 60)}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
            </div>

            <Button size="lg" className="h-14 px-12 text-lg font-bold w-full sm:w-auto" onClick={() => setIsStarted(true)}>
              Start Session Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFinished && !results) {
    return <div className="container mx-auto px-4 py-24 text-center"><div className="animate-pulse text-xl font-medium">Scoring your answers...</div></div>;
  }

  if (isFinished && results) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold">Session Results</h1>
          <Button variant="outline" asChild><Link href={`/exam-prep/${subjectId}`}><ArrowLeft className="mr-2 h-4 w-4"/> Exit</Link></Button>
        </div>

        <Card className="border-border shadow-md mb-8 overflow-hidden bg-background">
          <CardContent className="p-8 text-center bg-primary/5">
            <div className="text-6xl font-bold text-primary mb-2">{results.score} <span className="text-3xl text-muted-foreground">/ {results.total}</span></div>
            <p className="text-lg font-medium text-foreground mb-6">Score</p>
            <Progress value={(results.score / results.total) * 100} className="h-3 w-full max-w-md mx-auto" />
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-6">Detailed Review</h2>
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const result = results.results.find((r: any) => r.questionId === q.id);
            const isCorrect = result?.correct;
            const notAnswered = result?.selectedOption === -1;

            return (
              <Card key={q.id} className={`border-2 ${isCorrect ? 'border-emerald-500/30 bg-emerald-50/10' : notAnswered ? 'border-border' : 'border-destructive/30 bg-destructive/5'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="shrink-0 mt-1">
                      {isCorrect ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : notAnswered ? <div className="h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center text-xs font-bold text-muted-foreground">?</div> : <XCircle className="h-6 w-6 text-destructive" />}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium mb-1">Question {idx + 1}</div>
                      <h3 className="font-semibold text-lg">{q.questionText}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 ml-10">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = result?.selectedOption === oIdx;
                      const isActuallyCorrect = result?.correctOption === oIdx;
                      
                      let optClass = "border bg-background";
                      if (isActuallyCorrect) optClass = "border-emerald-500 bg-emerald-500/10 font-medium";
                      else if (isSelected && !isActuallyCorrect) optClass = "border-destructive bg-destructive/10 text-destructive";

                      return (
                        <div key={oIdx} className={`p-3 rounded-lg text-sm flex items-center gap-3 ${optClass}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${isActuallyCorrect ? 'bg-emerald-500 text-white border-transparent' : isSelected ? 'bg-destructive text-white border-transparent' : 'bg-background'}`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  {result?.explanation && (
                    <div className="mt-6 ml-10 p-4 rounded-lg bg-muted/50 border border-border/50 text-sm">
                      <span className="font-semibold block mb-1">Explanation:</span>
                      {result.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Session
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;
  const isTimeLow = timeLeft < 60; // less than 1 minute

  return (
    <div className="bg-muted/10 min-h-screen">
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-serif font-bold hidden sm:inline-block">{topic?.name}</span>
            <Badge variant="outline" className="font-mono text-sm px-2">
              {answeredCount} / {questions.length}
            </Badge>
          </div>
          
          <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-1.5 rounded-md ${isTimeLow ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted'}`}>
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>

          <Button onClick={handleSubmit} variant={answeredCount === questions.length ? "default" : "secondary"}>
            Submit <span className="hidden sm:inline">&nbsp;Session</span>
          </Button>
        </div>
        <Progress value={progressPercent} className="h-1 rounded-none bg-border" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8 pb-24">
        {questions.map((q, idx) => (
          <Card key={q.id} id={`q-${q.id}`} className="border-border shadow-sm scroll-mt-24">
            <CardContent className="p-6 md:p-8">
              <div className="flex gap-4 mb-6">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </div>
                <h3 className="font-medium text-lg leading-relaxed pt-0.5">{q.questionText}</h3>
              </div>
              
              <div className="space-y-3 ml-12">
                {q.options.map((opt, oIdx) => {
                  const isSelected = answers[q.id] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(q.id, oIdx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 hover:border-primary/40 ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background'}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span className={`${isSelected ? 'font-medium text-foreground' : 'text-foreground/80'}`}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="text-center pt-8">
          <Button size="lg" className="h-14 px-12 text-lg font-bold" onClick={handleSubmit}>
            Finish & Submit Session
          </Button>
        </div>
      </div>
    </div>
  );
}
