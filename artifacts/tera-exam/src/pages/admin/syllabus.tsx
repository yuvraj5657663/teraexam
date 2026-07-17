import { useState } from "react";
import { useAdminListSyllabus, useUpdateSyllabus, useCreateSyllabus, useDeleteSyllabus, getAdminListSyllabusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Edit, Trash2, Upload, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SyllabusInput } from "@workspace/api-client-react";

const syllabusSchema = z.object({
  title: z.string().min(1, "Title is required"),
  examName: z.string().min(1, "Exam name is required"),
  pdfUrl: z.string().url("Must be a valid URL").min(1, "PDF URL is required"),
  description: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export default function AdminSyllabus() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items = [], isLoading } = useAdminListSyllabus({ search: search || undefined });
  
  const createMutation = useCreateSyllabus();
  const updateMutation = useUpdateSyllabus();
  const deleteMutation = useDeleteSyllabus();

  const form = useForm<z.infer<typeof syllabusSchema>>({
    resolver: zodResolver(syllabusSchema),
    defaultValues: {
      title: "", examName: "", pdfUrl: "", description: "", status: "draft"
    }
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListSyllabusQueryKey() });
    queryClient.invalidateQueries({ queryKey: ['/api/home/summary'] });
  };

  const handleTogglePublish = (id: number, currentStatus: "draft" | "published") => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    updateMutation.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: `Syllabus ${newStatus === 'published' ? 'published' : 'unpublished'}.` });
        invalidate();
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this syllabus?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Syllabus deleted." });
        invalidate();
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('tera_exam_admin_token');
    
    try {
      const res = await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/admin/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      form.setValue('pdfUrl', data.url, { shouldValidate: true });
      toast({ title: "File uploaded successfully." });
    } catch (err) {
      toast({ title: "Upload failed. Try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    form.reset({
      ...item,
      description: item.description || "",
    });
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      title: "", examName: "", pdfUrl: "", description: "", status: "draft"
    });
    setIsFormOpen(true);
  };

  const onSubmit = (values: z.infer<typeof syllabusSchema>) => {
    const data: SyllabusInput = values;

    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          toast({ title: "Syllabus updated." });
          setIsFormOpen(false);
          invalidate();
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Syllabus created." });
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
          <h1 className="text-3xl font-serif font-bold text-foreground">Syllabus PDFs</h1>
          <p className="text-muted-foreground mt-1">Manage official exam syllabus documents</p>
        </div>
        <Button onClick={openCreate} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Syllabus
        </Button>
      </div>

      <Card className="mb-6 shadow-sm border-border/50">
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search syllabus..." 
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
              <TableHead>Exam Name</TableHead>
              <TableHead>PDF Link</TableHead>
              <TableHead className="w-24 text-center">Published</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No syllabus found</TableCell></TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.examName}</TableCell>
                  <TableCell>
                    <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                      <FileText className="h-4 w-4" /> View PDF
                    </a>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch 
                      checked={item.status === "published"}
                      onCheckedChange={() => handleTogglePublish(item.id, item.status)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(item.id)}>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Syllabus' : 'Add New Syllabus'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
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
              <FormField control={form.control} name="pdfUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF URL</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1"><Input type="url" {...field} /></FormControl>
                    <div className="relative overflow-hidden shrink-0">
                      <Button type="button" variant="secondary" disabled={isUploading}>
                        {isUploading ? <span className="animate-spin mr-2">⏳</span> : <Upload className="h-4 w-4 mr-2" />}
                        Upload
                      </Button>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                  {editingId ? 'Save Changes' : 'Create Syllabus'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
