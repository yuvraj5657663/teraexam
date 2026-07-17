import { useState } from "react";
import { 
  useAdminListSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject,
  useAdminListTopics, useCreateTopic, useUpdateTopic, useDeleteTopic,
  useAdminListQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion,
  getAdminListSubjectsQueryKey, getAdminListTopicsQueryKey, getAdminListQuestionsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, ChevronRight, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- SCHEMAS ---
const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable()
});

const topicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  options: z.array(z.string().min(1, "Option cannot be empty")).length(4),
  correctOptionIndex: z.coerce.number().min(0).max(3),
  explanation: z.string().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export default function AdminExamPrep() {
  const [view, setView] = useState<'subjects' | 'topics' | 'questions'>('subjects');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: subjects = [], isLoading: isLoadingSubjects } = useAdminListSubjects();
  const { data: topics = [], isLoading: isLoadingTopics } = useAdminListTopics({ subjectId: selectedSubjectId || undefined });
  const { data: questions = [], isLoading: isLoadingQuestions } = useAdminListQuestions({ topicId: selectedTopicId || undefined });

  // Subject Handlers
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  
  const subjectForm = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: "", slug: "", description: "" }
  });

  const onSubjectSubmit = (values: z.infer<typeof subjectSchema>) => {
    if (editingSubject) {
      updateSubject.mutate({ id: editingSubject.id, data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListSubjectsQueryKey() });
          setIsSubjectFormOpen(false);
          toast({ title: "Subject updated." });
        }
      });
    } else {
      createSubject.mutate({ data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListSubjectsQueryKey() });
          setIsSubjectFormOpen(false);
          toast({ title: "Subject created." });
        }
      });
    }
  };

  // Topic Handlers
  const [isTopicFormOpen, setIsTopicFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();

  const topicForm = useForm({
    resolver: zodResolver(topicSchema),
    defaultValues: { name: "", slug: "" }
  });

  const onTopicSubmit = (values: z.infer<typeof topicSchema>) => {
    if (!selectedSubjectId) return;
    const data = { ...values, subjectId: selectedSubjectId };
    
    if (editingTopic) {
      updateTopic.mutate({ id: editingTopic.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListTopicsQueryKey() });
          setIsTopicFormOpen(false);
          toast({ title: "Topic updated." });
        }
      });
    } else {
      createTopic.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListTopicsQueryKey() });
          setIsTopicFormOpen(false);
          toast({ title: "Topic created." });
        }
      });
    }
  };

  // Question Handlers
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const questionForm = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: { 
      questionText: "", 
      options: ["", "", "", ""], 
      correctOptionIndex: 0, 
      explanation: "", 
      difficulty: "medium" 
    }
  });

  const onQuestionSubmit = (values: z.infer<typeof questionSchema>) => {
    if (!selectedTopicId) return;
    const data = { ...values, topicId: selectedTopicId };

    if (editingQuestion) {
      updateQuestion.mutate({ id: editingQuestion.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListQuestionsQueryKey() });
          setIsQuestionFormOpen(false);
          toast({ title: "Question updated." });
        }
      });
    } else {
      createQuestion.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListQuestionsQueryKey() });
          setIsQuestionFormOpen(false);
          toast({ title: "Question created." });
        }
      });
    }
  };

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);
  const activeTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Exam Prep Manager</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm font-medium">
            <button 
              onClick={() => { setView('subjects'); setSelectedSubjectId(null); setSelectedTopicId(null); }}
              className={`hover:text-primary transition-colors ${view === 'subjects' ? 'text-primary' : ''}`}
            >
              Subjects
            </button>
            {activeSubject && (
              <>
                <ChevronRight className="h-4 w-4" />
                <button 
                  onClick={() => { setView('topics'); setSelectedTopicId(null); }}
                  className={`hover:text-primary transition-colors ${view === 'topics' ? 'text-primary' : ''}`}
                >
                  {activeSubject.name}
                </button>
              </>
            )}
            {activeTopic && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className={`${view === 'questions' ? 'text-primary' : ''}`}>
                  {activeTopic.name}
                </span>
              </>
            )}
          </div>
        </div>

        {view === 'subjects' && (
          <Button onClick={() => { setEditingSubject(null); subjectForm.reset({ name: "", slug: "", description: "" }); setIsSubjectFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Subject
          </Button>
        )}
        {view === 'topics' && (
          <Button onClick={() => { setEditingTopic(null); topicForm.reset({ name: "", slug: "" }); setIsTopicFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Topic
          </Button>
        )}
        {view === 'questions' && (
          <Button onClick={() => { setEditingQuestion(null); questionForm.reset({ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, explanation: "", difficulty: "medium" }); setIsQuestionFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden">
        
        {view === 'subjects' && (
          <ScrollArea className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(sub => (
                <Card key={sub.id} className="hover:border-primary/50 transition-colors group">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex justify-between items-start">
                      <span className="font-serif text-xl">{sub.name}</span>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingSubject(sub); subjectForm.reset({ ...sub, description: sub.description ?? undefined }); setIsSubjectFormOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); if(confirm('Delete subject?')) deleteSubject.mutate({id: sub.id}, {onSuccess: ()=>queryClient.invalidateQueries({queryKey: getAdminListSubjectsQueryKey()})}); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{sub.slug}</p>
                  </CardHeader>
                  <CardContent>
                    <Button variant="secondary" className="w-full" onClick={() => { setSelectedSubjectId(sub.id); setView('topics'); }}>
                      Manage Topics <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {subjects.length === 0 && !isLoadingSubjects && (
                <div className="col-span-full py-12 text-center text-muted-foreground">No subjects found.</div>
              )}
            </div>
          </ScrollArea>
        )}

        {view === 'topics' && (
          <ScrollArea className="flex-1 p-6">
            <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => setView('subjects')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map(top => (
                <Card key={top.id} className="hover:border-primary/50 transition-colors group bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex justify-between items-center">
                      <span className="font-bold text-lg">{top.name}</span>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingTopic(top); topicForm.reset(top); setIsTopicFormOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); if(confirm('Delete topic?')) deleteTopic.mutate({id: top.id}, {onSuccess: ()=>queryClient.invalidateQueries({queryKey: getAdminListTopicsQueryKey()})}); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{top.slug}</p>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-background" onClick={() => { setSelectedTopicId(top.id); setView('questions'); }}>
                      Manage Question Bank <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {topics.length === 0 && !isLoadingTopics && (
                <div className="col-span-full py-12 text-center text-muted-foreground">No topics found. Add one to get started.</div>
              )}
            </div>
          </ScrollArea>
        )}

        {view === 'questions' && (
          <ScrollArea className="flex-1 p-6">
            <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => setView('topics')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
            </Button>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Card key={q.id} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-lg">{q.questionText}</h3>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingQuestion(q); questionForm.reset({ ...q, explanation: q.explanation || "", difficulty: (q.difficulty as "easy" | "medium" | "hard") || "medium" }); setIsQuestionFormOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if(confirm('Delete question?')) deleteQuestion.mutate({id: q.id}, {onSuccess: ()=>queryClient.invalidateQueries({queryKey: getAdminListQuestionsQueryKey()})}); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`p-3 rounded border text-sm flex items-center gap-2 ${q.correctOptionIndex === oIdx ? 'bg-emerald-500/10 border-emerald-500/30 font-medium' : 'bg-muted/30 border-transparent'}`}>
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-background border">{String.fromCharCode(65 + oIdx)}</span>
                              {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div className="mt-4 p-4 rounded-md bg-muted/50 text-sm">
                            <span className="font-semibold block mb-1">Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {questions.length === 0 && !isLoadingQuestions && (
                <div className="py-12 text-center text-muted-foreground">No questions found in this topic. Add some to build the bank.</div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* --- FORMS --- */}
      <Dialog open={isSubjectFormOpen} onOpenChange={setIsSubjectFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSubject ? 'Edit Subject' : 'New Subject'}</DialogTitle></DialogHeader>
          <Form {...subjectForm}>
            <form onSubmit={subjectForm.handleSubmit(onSubjectSubmit)} className="space-y-4">
              <FormField control={subjectForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Subject Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={subjectForm.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={subjectForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value||''} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter className="pt-4"><Button type="submit">Save</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTopicFormOpen} onOpenChange={setIsTopicFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTopic ? 'Edit Topic' : 'New Topic'}</DialogTitle></DialogHeader>
          <Form {...topicForm}>
            <form onSubmit={topicForm.handleSubmit(onTopicSubmit)} className="space-y-4">
              <FormField control={topicForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Topic Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={topicForm.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter className="pt-4"><Button type="submit">Save</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuestionFormOpen} onOpenChange={setIsQuestionFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingQuestion ? 'Edit Question' : 'New Question'}</DialogTitle></DialogHeader>
          <Form {...questionForm}>
            <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
              <FormField control={questionForm.control} name="questionText" render={({ field }) => (
                <FormItem><FormLabel>Question Text</FormLabel><FormControl><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                {[0,1,2,3].map(i => (
                  <FormField key={i} control={questionForm.control} name={`options.${i}`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option {String.fromCharCode(65 + i)}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={questionForm.control} name="correctOptionIndex" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select correct option" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[0,1,2,3].map(i => (
                          <SelectItem key={i} value={i.toString()}>Option {String.fromCharCode(65 + i)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={questionForm.control} name="difficulty" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={questionForm.control} name="explanation" render={({ field }) => (
                <FormItem><FormLabel>Explanation (Optional)</FormLabel><FormControl><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" {...field} value={field.value||''} /></FormControl><FormMessage /></FormItem>
              )} />

              <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => setIsQuestionFormOpen(false)}>Cancel</Button><Button type="submit">Save Question</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
