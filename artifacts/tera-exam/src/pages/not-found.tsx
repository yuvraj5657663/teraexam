import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, FileSearch } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="text-[120px] md:text-[160px] font-serif font-extrabold text-muted-foreground/10 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FileSearch className="h-16 w-16 text-muted-foreground/40" aria-hidden="true" />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
        Page Not Found
      </h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        The exam notification or resource you're looking for may have been moved, removed, or
        doesn't exist. Check the URL or head back to browse all content.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Link>
        </Button>
        <Button variant="outline" size="lg" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
