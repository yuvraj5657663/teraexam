import { useRoute, Link } from "wouter";
import { useGetBlog, getGetBlogQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CATEGORY_COLORS: Record<string, string> = {
  SSC: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  UPSC: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Railways: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  Banking: "bg-green-500/10 text-green-700 dark:text-green-400",
  "Exam Prep": "bg-primary/10 text-primary",
  "Current Affairs": "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export default function BlogDetail() {
  const [, params] = useRoute("/blogs/:id");
  const { toast } = useToast();
  const blogId = Number(params?.id);
  const { data: post, isLoading, isError } = useGetBlog(blogId, { 
    query: { enabled: !!blogId, queryKey: getGetBlogQueryKey(blogId) } 
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard!" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-2xl">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-2xl">
        <h1 className="text-3xl font-serif font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">
          This article doesn't exist or may have been removed.
        </p>
        <Button asChild>
          <Link href="/blogs">Back to Blogs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Back */}
      <Link
        href="/blogs"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" /> Back to Blogs
      </Link>

      <article>
        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {post.category}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }) : new Date(post.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readTime}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            {post.author}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            aria-label="Share article"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" /> Share
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {post.content.split("\n\n").map((paragraph, i) => {
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              return (
                <h2 key={i} className="text-xl font-serif font-bold mt-8 mb-3 text-foreground">
                  {paragraph.replace(/\*\*/g, "")}
                </h2>
              );
            }
            // Bold inline text
            const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className="text-foreground/90 leading-relaxed mb-4">
                {parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j}>{part.replace(/\*\*/g, "")}</strong>
                  ) : (
                    part
                  ),
                )}
              </p>
            );
          })}
        </div>
      </article>

      {/* Back button */}
      <div className="mt-12 pt-8 border-t">
        <Button variant="outline" asChild>
          <Link href="/blogs">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to All Articles
          </Link>
        </Button>
      </div>
    </div>
  );
}
