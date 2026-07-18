import { useState } from "react";
import {
  useAdminListQuestions,
  useUpdateQuestion,
  useCreateQuestion,
  useDeleteQuestion,
  getAdminListQuestionsQueryKey,
  useAdminListSubjects,
  useAdminListTopics,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { QuestionInput } from "@workspace/api-client-react";

const questionSchema = z.object({
  topicId: z.coerce.number().min(1, "Topic is required"),
  questionText: z.string().min(1, "Question text is required"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options required"),
  correctOptionIndex: z.coerce.number().min(0).max(3),
  explanation: z.string().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-500/10 text-green-700 dark:text-green-400",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  hard: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function AdminExamPrep() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formSubjectId, setFormSubjectId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Data fetching
  const { data: subjectsData } = useAdminListSubjects();
  const subjects = Array.isArray(subjectsData) ? subjectsData : [];

  const { data: topicsData } = useAdminListTopics(
    selectedSubjectId ? { subjectId: selectedSubjectId } : {},
  );
  const topics = Array.isArray(topicsData) ? topicsData : [];

  const { data: questionsData, isLoading } = useAdminListQuestions(
    selectedTopicId ? { topicId: selectedTopicId } : {},
  );
  const questions = Array.isArray(questionsData) ? questionsData : [];

  // Form topics (for create/edit modal)
  const { data: formTopicsData } = useAdminListTopics(
    formSubjectId ? { subjectId: formSubjectId } : {},
  );
  const formTopics = Array.isArray(formTopicsData) ? formTopicsData : [];

  // Mutations
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      topicId: 0,
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: "",
      difficulty: "medium",
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListQuestionsQueryKey() });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Question deleted." });
        invalidate();
      },
      onError: () => toast({ title: "Failed to delete question.", variant: "destructive" }),
    });
  };

  const openEdit = (item: {
    id: number;
    topicId: number;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string | null;
    difficulty: string;
  }) => {
    setEditingId(item.id);
    // Find subject for this topic
    const matchingTopic = topics.find((t: { id: number }) => t.id === item.topicId);
    if (matchingTopic) {
      const matchingSubject = subjects.find(
        (s: { id: number }) =>
          s.id === (matchingTopic as { subjectId: number }).subjectId,
      );
      if (matchingSubject) setFormSubjectId((matchingSubject as { id: number }).id);
    }
    form.reset({
      topicId: item.topicId,
      questionText: item.questionText,
      options: item.options.length >= 4 ? item.options.slice(0, 4) : [...item.options, ...Array(4 - item.options.length).fill("")],
      correctOptionIndex: item.correctOptionIndex,
      explanation: item.explanation ?? "",
      difficulty: (item.difficulty as "easy" | "medium" | "hard") ?? "medium",
    });
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormSubjectId(null);
    form.reset({
      topicId: 0,
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: "",
      difficulty: "medium",
    });
    setIsFormOpen(true);
  };

  const onSubmit = (values: z.infer<typeof questionSchema>) => {
    const payload: QuestionInput = {
      topicId: values.topicId,
      questionText: values.questionText,
      options: values.options,
      correctOptionIndex: values.correctOptionIndex,
      explanation: values.explanation ?? null,
      difficulty: values.difficulty,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Question updated." });
          setIsFormOpen(false);
          invalidate();
        },
        onError: () => toast({ title: "Failed to update.", variant: "destructive" }),
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Question created." });
          setIsFormOpen(false);
          invalidate();
        },
        onError: () => toast({ title: "Failed to create.", variant: "destructive" }),
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Exam Questions</h1>
          <p className="text-muted-foreground mt-1">Manage MCQ practice questions by subject and topic</p>
        </div>
        <Button onClick={openCreate} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-sm border-border/50">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Subject
            </label>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[180px]"
              value={selectedSubjectId ?? ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setSelectedSubjectId(val);
                setSelectedTopicId(null);
              }}
              aria-label="Filter by subject"
            >
              <option value="">All Subjects</option>
              {subjects.map((s: { id: number; name: string }) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {selectedSubjectId && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Topic
              </label>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[180px]"
                value={selectedTopicId ?? ""}
                onChange={(e) => setSelectedTopicId(e.target.value ? Number(e.target.value) : null)}
                aria-label="Filter by topic"
              >
                <option value="">All Topics</option>
                {topics.map((t: { id: number; name: string }) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="ml-auto text-sm text-muted-foreground font-mono">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead className="w-32">Difficulty</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                  {selectedTopicId
                    ? "No questions for this topic."
                    : "Select a subject and topic to view questions."}
                </TableCell>
              </TableRow>
            ) : (
              questions.map((item: {
                id: number;
                topicId: number;
                questionText: string;
                options: string[];
                correctOptionIndex: number;
                explanation?: string | null;
                difficulty: string;
              }) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium text-foreground truncate max-w-xl">
                      {item.questionText}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.options.length} options · Correct: {String.fromCharCode(65 + item.correctOptionIndex)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                        DIFFICULTY_COLORS[item.difficulty] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Question" : "Add New Question"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Subject selector */}
              <div>
                <label className="text-sm font-medium">Subject</label>
                <select
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formSubjectId ?? ""}
                  onChange={(e) => {
                    setFormSubjectId(e.target.value ? Number(e.target.value) : null);
                    form.setValue("topicId", 0);
                  }}
                >
                  <option value="">Select subject...</option>
                  {subjects.map((s: { id: number; name: string }) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <FormField
                control={form.control}
                name="topicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!formSubjectId}
                      >
                        <option value="">Select topic...</option>
                        {formTopics.map((t: { id: number; name: string }) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Enter the question..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Options (A, B, C, D)</FormLabel>
                {[0, 1, 2, 3].map((idx) => (
                  <FormField
                    key={idx}
                    control={form.control}
                    name={`options.${idx}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2 items-center">
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <Input
                              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <FormField
                control={form.control}
                name="correctOptionIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        {[0, 1, 2, 3].map((i) => (
                          <option key={i} value={i}>
                            Option {String.fromCharCode(65 + i)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation (Optional)</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Explain why this answer is correct..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? "Save Changes" : "Create Question"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
