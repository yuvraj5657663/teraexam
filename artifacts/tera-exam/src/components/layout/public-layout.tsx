import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-serif font-bold text-2xl tracking-tighter text-primary">TERA EXAM</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/jobs" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/jobs') ? 'text-primary' : 'text-muted-foreground'}`}>Jobs</Link>
              <Link href="/results" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/results') ? 'text-primary' : 'text-muted-foreground'}`}>Results</Link>
              <Link href="/admit-cards" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/admit-cards') ? 'text-primary' : 'text-muted-foreground'}`}>Admit Cards</Link>
              <Link href="/syllabus" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/syllabus') ? 'text-primary' : 'text-muted-foreground'}`}>Syllabus</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/exam-prep">
              <Button variant="default" className="font-semibold shadow-md">
                Exam Prep
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t bg-muted/40 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-serif font-bold text-2xl tracking-tighter text-foreground block mb-4">TERA EXAM</span>
            <p className="text-muted-foreground text-sm max-w-sm">
              The fastest and most reliable Sarkari exam information platform. Get real-time updates on jobs, results, admit cards, and prepare for your next exam.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs" className="hover:text-primary transition-colors">Latest Jobs</Link></li>
              <li><Link href="/results" className="hover:text-primary transition-colors">Exam Results</Link></li>
              <li><Link href="/admit-cards" className="hover:text-primary transition-colors">Admit Cards</Link></li>
              <li><Link href="/syllabus" className="hover:text-primary transition-colors">Syllabus PDFs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} TERA EXAM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
