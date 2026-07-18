import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, GraduationCap } from "lucide-react";

const navLinks = [
  { href: "/jobs", label: "Jobs" },
  { href: "/results", label: "Results" },
  { href: "/admit-cards", label: "Admit Cards" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/blogs", label: "Blogs" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="font-serif font-bold text-xl tracking-tighter text-primary">
                TERA EXAM
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-6" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm px-1 ${
                    location.startsWith(link.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  aria-current={location.startsWith(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link href="/exam-prep" className="hidden sm:block">
              <Button variant="default" size="sm" className="font-semibold shadow-sm">
                Exam Prep
              </Button>
            </Link>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col gap-1">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-3 rounded-md font-semibold text-primary"
                  >
                    <GraduationCap className="h-5 w-5" />
                    TERA EXAM
                  </Link>

                  <div className="h-px bg-border my-2" />

                  <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          location.startsWith(link.href)
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="h-px bg-border my-2" />

                  <Link href="/exam-prep" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full font-semibold mt-2">Exam Prep</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Page content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 flex flex-col" id="main-content">
        {children}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                               */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t bg-muted/40 py-12" role="contentinfo">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-serif font-bold text-xl tracking-tighter text-foreground">
                TERA EXAM
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              India's fastest and most reliable Sarkari exam information platform. Real-time
              updates on jobs, results, admit cards, and structured MCQ practice.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { href: "/jobs", label: "Latest Jobs" },
                { href: "/results", label: "Exam Results" },
                { href: "/admit-cards", label: "Admit Cards" },
                { href: "/syllabus", label: "Syllabus PDFs" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/blogs", label: "Aspirant Blogs" },
                { href: "/privacy", label: "Privacy Policy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-10 pt-8 border-t text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} TERA EXAM. All rights reserved.
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
