import { useState } from "react";
import { useAdminListJobs, useUpdateJob, useCreateJob, useDeleteJob, getAdminListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { JobInput } from "@workspace/api-client-react";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  examName: z.string().min(1, "Exam name is required"),
  postDate: z.string().min(1, "Post date is required"),
  lastDate: z.string().optional().nullable(),
  applyLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable(),
  vacancies: z.coerce.number().optional().nullable(),
  category: z.string().optional().nullable(),
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["draft", "published"]).default("draft"),
});

export default function AdminJobs() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useAdminListJobs({ search: search || undefined });
  // API returns { data: [...], pagination: {...} } but generated types still say array
  const jobs = (data as any)?.data ?? data ?? [];
  
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const deleteMutation = useDeleteJob();

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "", organization: "", examName: "", postDate: new Date().toISOString().split('T')[0],
      slug: "", status: "draft"
    }
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListJobsQueryKey() });
    queryClient.invalidateQueries({ queryKey: ['/api/home/summary'] });
  };

  const handleTogglePublish = (id: number, currentStatus: "draft" | "published") => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    updateMutation.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: `Job ${newStatus === 'published' ? 'published' : 'unpublished'}.` });
        invalidate();
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Job deleted." });
        invalidate();
      }
    });
  };

  const openEdit = (job: { id: number; title: string; organization: string; examName: string; postDate?: string | Date | null; lastDate?: string | Date | null; applyLink?: string | null; description?: string | null; vacancies?: number | null; category?: string | null; status: "draft" | "published"; slug: string }) => {
    setEditingId(job.id);
    const postDateStr = typeof job.postDate === 'string' ? job.postDate : job.postDate?.toISOString().split('T')[0] || '';
    const lastDateStr = job.lastDate ? (typeof job.lastDate === 'string' ? job.lastDate : job.lastDate.toISOString().split('T')[0]) : '';
    form.reset({
      ...job,
      postDate: postDateStr,
      lastDate: lastDateStr,
      applyLink: job.applyLink || "",
      description: job.description || "",
      vacancies: job.vacancies || undefined,
      category: job.category || "",
    });
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      title: "", organization: "", examName: "", postDate: new Date().toISOString().split('T')[0],
      lastDate: "", applyLink: "", description: "", vacancies: undefined, category: "",
      slug: "", status: "draft"
    });
    setIsFormOpen(true);
  };

  const onSubmit = (values: z.infer<typeof jobSchema>) => {
    const data: JobInput = {
      ...values,
      applyLink: values.applyLink || null,
      lastDate: values.lastDate ? new Date(values.lastDate).toISOString() : null,
      postDate: new Date(values.postDate).toISOString(),
      vacancies: values.vacancies || null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          toast({ title: "Job updated." });
          setIsFormOpen(false);
          invalidate();
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Job created." });
          setIsFormOpen(false);
          invalidate();
        }
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Jobs Database</h1>
          <p className="text-muted-foreground mt-1">Manage job notifications and vacancies</p>
        </div>
        <Button onClick={openCreate} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Job
        </Button>
      </div>

      <Card className="mb-6 shadow-sm border-border/50">
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="w-24 text-center">Published</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : jobs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No jobs found</TableCell></TableRow>
            ) : (
              jobs.map((job: any) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{job.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">{job.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{job.organization}</Badge>
                    <div className="text-xs text-muted-foreground mt-1">{job.examName}</div>
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    <div>Post: {job.postDate.split('T')[0]}</div>
                    {job.lastDate && <div>Last: {job.lastDate.split('T')[0]}</div>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch 
                      checked={job.status === "published"}
                      onCheckedChange={() => handleTogglePublish(job.id, job.status)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(job)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(job.id)}>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Job' : 'Add New Job'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Job Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. ssc-cgl-2024" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="organization" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="examName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="postDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Date (Optional)</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="vacancies" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vacancies</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="applyLink" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Apply Link (URL)</FormLabel>
                    <FormControl><Input type="url" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Save Changes' : 'Create Job'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
