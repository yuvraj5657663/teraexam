import { GraduationCap, Target, Users, Zap, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Real-Time Updates",
    description:
      "Notifications go live within minutes of official release — no delay, no outdated info.",
  },
  {
    icon: CheckCircle,
    title: "Verified Information",
    description:
      "Every listing is reviewed before publishing. We cross-check with official government portals.",
  },
  {
    icon: Target,
    title: "Exam-Focused Practice",
    description:
      "Structured MCQ sessions with explanations designed by subject-matter experts for SSC, UPSC, and more.",
  },
  {
    icon: Users,
    title: "Built for Aspirants",
    description:
      "Everything on this platform is designed around what a serious government exam aspirant actually needs.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 border-b py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-primary/10 rounded-2xl mb-6">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 tracking-tight">
            About TERA EXAM
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We built TERA EXAM because we know how hard the sarkari exam journey is. Missed
            deadlines, unverified information, and scattered resources cost aspirants real
            opportunities. We're here to fix that.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-serif font-bold mb-6">Our Mission</h2>
        <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
          <p>
            TERA EXAM exists to make government exam preparation accessible, organised, and
            stress-free. We aggregate verified notifications for Jobs, Results, and Admit Cards
            from all major recruitment bodies — SSC, UPSC, IBPS, Railway, State PSCs, and more.
          </p>
          <p>
            Beyond information, we offer a structured Exam Prep Zone — topic-wise MCQ practice
            sessions with instant scoring and detailed explanations — so aspirants can study and
            track their preparation in one place.
          </p>
          <p>
            We are an independent platform with no affiliation to any government body. All
            information published here is for informational purposes only. Always verify details
            with the official recruitment board website before taking action.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/20 border-t border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-serif font-bold mb-10 text-center">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-border/60">
                <CardContent className="p-6 flex gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 container mx-auto px-4 max-w-4xl">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-6">
          <h3 className="font-semibold text-amber-900 dark:text-amber-400 mb-2">Disclaimer</h3>
          <p className="text-sm text-amber-800 dark:text-amber-300/80 leading-relaxed">
            TERA EXAM is an independent information aggregation platform. We are not affiliated
            with any government body, recruitment board, or official institution. All exam
            notifications, results, and admit card information are published for informational
            purposes only. Always verify with the official organisation before applying or making
            decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
