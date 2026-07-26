import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Github, Linkedin, Mail, Sparkles, Droplet, Trophy } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Vision AI — BloodBridge" },
      { name: "description", content: "Meet Vision AI — the team behind BloodBridge, built for the Build with Bharat hackathon." },
      { property: "og:title", content: "Team Vision AI — BloodBridge" },
      { property: "og:description", content: "The minds behind BloodBridge, built for Build with Bharat." },
    ],
  }),
  component: TeamPage,
});

type Member = {
  name: string;
  role: string;
  bio: string;
  photo: string;
  socials: { github?: string; linkedin?: string; email?: string };
  skills: string[];
};

const TEAM: Member[] = [
  {
    name: "Member One",
    role: "Full-stack Engineer",
    bio: "Builds the AI matching engine and real-time request pipeline. Loves shipping fast and clean.",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=one&backgroundColor=fecaca",
    socials: { github: "#", linkedin: "#", email: "#" },
    skills: ["React", "Node.js", "AI/ML"],
  },
  {
    name: "Member Two",
    role: "Product & Design",
    bio: "Designs the donor-first experience. Turns life-critical workflows into calm, human interfaces.",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=two&backgroundColor=fed7aa",
    socials: { github: "#", linkedin: "#", email: "#" },
    skills: ["UX", "Figma", "Research"],
  },
  {
    name: "Member Three",
    role: "Data & Growth",
    bio: "Owns geo-matching data, impact analytics, and hospital onboarding across Bharat.",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=three&backgroundColor=bfdbfe",
    socials: { github: "#", linkedin: "#", email: "#" },
    skills: ["Data", "Ops", "Growth"],
  },
];

function TeamPage() {
  const router = useRouter();
  return (
    <div className="min-h-dvh bg-background">
      {/* Ambient */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <button
          onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }))}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-crimson glow-primary">
            <Droplet className="h-4 w-4 fill-white text-white" strokeWidth={2.5} />
          </div>
          <span className="display text-base font-bold tracking-tight">BloodBridge</span>
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        {/* Hero */}
        <section className="pt-6 pb-12 text-center md:pt-10 md:pb-16">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Build with Bharat · Hackathon 2026
          </div>
          <h1 className="display mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Team <span className="text-gradient">Vision AI</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Three builders shipping <span className="font-semibold text-foreground">BloodBridge</span> — an AI-powered
            emergency blood network for India. Every second counts. So do we.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Made in Bharat, for Bharat
          </div>
        </section>

        {/* Team grid */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Team members">
          {TEAM.map((m) => (
            <article
              key={m.name}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-ring"
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" aria-hidden />
              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md ring-1 ring-border">
                    <img
                      src={m.photo}
                      alt={`Photo of ${m.name}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-crimson text-white shadow-md ring-2 ring-background">
                    <Droplet className="h-3.5 w-3.5 fill-white" strokeWidth={2.5} />
                  </span>
                </div>
                <h2 className="mt-4 display text-xl font-bold tracking-tight">{m.name}</h2>
                <div className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{m.role}</div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                  {m.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  {m.socials.github && (
                    <a
                      href={m.socials.github}
                      className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`${m.name} on GitHub`}
                    >
                      <Github className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {m.socials.linkedin && (
                    <a
                      href={m.socials.linkedin}
                      className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`${m.name} on LinkedIn`}
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {m.socials.email && (
                    <a
                      href={m.socials.email}
                      className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Email ${m.name}`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Placeholder notice */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Demo placeholders — swap in real photos, names, and socials in <code className="rounded bg-muted px-1 py-0.5">src/routes/team.tsx</code>.
        </p>

        {/* CTA */}
        <section className="mt-14 rounded-2xl border border-border bg-card p-8 text-center md:p-10">
          <h3 className="display text-2xl font-bold tracking-tight md:text-3xl">
            Built for the moments that decide a life.
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Explore the demo — switch between Donor, Hospital, and Admin to see the network in motion.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try the live demo <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </section>
      </main>
    </div>
  );
}
