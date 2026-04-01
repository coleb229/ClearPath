import Link from "next/link";
import {
  FileText,
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Nav */}
      <header className="border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            ClearPath
          </span>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-[var(--dur-state)] hover:brightness-110 active:translate-y-px"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-2xl animate-fade-up">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Build resumes that
              <span className="text-primary"> open doors</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              ClearPath helps you craft tailored resumes and cover letters with
              AI that understands your career story. Build once, customize for
              every opportunity.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-all duration-[var(--dur-state)] hover:brightness-110 active:translate-y-px"
              >
                Start Building — Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="border-t border-border/50 bg-secondary/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
              <div className="animate-fade-up">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Profile-First Approach
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Build your professional profile once. Generate tailored
                  resumes and cover letters for every job application.
                </p>
              </div>
              <div className="animate-fade-up animate-delay-1">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  AI-Powered Writing
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Get intelligent suggestions for bullet points, summaries, and
                  cover letters that highlight your strengths.
                </p>
              </div>
              <div className="animate-fade-up animate-delay-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Job-Tailored Output
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Paste a job description and let AI analyze it, then tailor
                  your resume to match what employers are looking for.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-12">
            How it works
          </h2>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Build your profile",
                desc: "Add your experience, education, skills, and projects. This is your single source of truth.",
              },
              {
                step: "2",
                title: "Add a job listing",
                desc: "Paste in the job description. AI analyzes requirements, keywords, and culture signals.",
              },
              {
                step: "3",
                title: "Generate & refine",
                desc: "Create a tailored resume and cover letter. AI suggests improvements, you keep full control.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 items-start animate-fade-up"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>ClearPath</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Your data stays yours</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
