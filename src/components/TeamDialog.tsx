import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { Github, Linkedin, Mail, Trophy, Droplet, Sparkles, GraduationCap, Crown } from "lucide-react";


type Member = {
  name: string;
  role: string;
  bio: string;
  seed: string;
  bg: string;
  skills: string[];
  isLead?: boolean;
};

const TEAM: Member[] = [
  {
    name: "Yuvraj Verma",
    role: "Team Leader · Full-stack & AI",
    bio: "Architects the AI matching engine, real-time request pipeline and the end-to-end product vision.",
    seed: "yuvraj-verma",
    bg: "fecaca",
    skills: ["React", "AI/ML", "Systems"],
    isLead: true,
  },
  {
    name: "Tanu Chotwani",
    role: "Product & UX",
    bio: "Designs donor-first flows. Turns life-critical workflows into calm, human interfaces.",
    seed: "tanu-chotwani",
    bg: "fed7aa",
    skills: ["UX", "Figma", "Research"],
  },
  {
    name: "Riya Sharma",
    role: "Data & Analytics",
    bio: "Owns geo-matching data, impact analytics, and donor reliability signals across Bharat.",
    seed: "riya-sharma",
    bg: "bfdbfe",
    skills: ["Data", "Analytics", "Growth"],
  },
  {
    name: "Shaurya Anchal",
    role: "Frontend Engineer",
    bio: "Builds the dashboard, live activity feed and mobile PWA. Pixel-perfect and lightning fast.",
    seed: "shaurya-anchal",
    bg: "c7d2fe",
    skills: ["React", "PWA", "UI"],
  },
  {
    name: "Ansh Bhatt",
    role: "Backend & Integrations",
    bio: "Wires SMS, geo-alerts and the certificate pipeline. Keeps the network reliable and secure.",
    seed: "ansh-bhatt",
    bg: "bbf7d0",
    skills: ["APIs", "Cloud", "DevOps"],
  },
];

export function TeamDialog() {
  const { teamOpen, setTeamOpen } = useStore();
  const [active, setActive] = useState<Member | null>(null);

  return (
    <>
      <Dialog open={teamOpen} onOpenChange={(o) => { setTeamOpen(o); if (!o) setActive(null); }}>
        <DialogContent className="max-w-2xl max-h-[92dvh] overflow-y-auto p-0">
          {/* Banner */}
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-crimson px-6 py-6 text-white">
            <div aria-hidden className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <DialogHeader className="space-y-2 text-left">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
                <Trophy className="h-3 w-3" /> Build with Bharat · 2026
              </div>
              <DialogTitle className="display text-3xl font-bold tracking-tight sm:text-4xl">
                Team <span className="italic">Vision AI</span>
              </DialogTitle>
              <DialogDescription className="text-white/85">
                Five builders from <span className="inline-flex items-center gap-1 font-semibold text-white"><GraduationCap className="h-3.5 w-3.5" /> ADGIPS</span> shipping BloodBridge — an AI-powered emergency blood network for India.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Compact avatar grid — click to reveal */}
          <div className="p-5">
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Tap a member to view profile
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {TEAM.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setActive(m)}
                  className={`group relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    m.isLead ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                  }`}
                  aria-label={`View profile of ${m.name}`}
                >
                  {m.isLead && (
                    <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary-foreground">
                      <Crown className="h-2 w-2" /> Lead
                    </span>
                  )}
                  <div className="relative">
                    <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm ring-1 ring-border transition-transform group-hover:scale-105">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.seed}&backgroundColor=${m.bg}`}
                        alt={`${m.name} avatar`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-crimson text-white ring-2 ring-background">
                      <Droplet className="h-2.5 w-2.5 fill-white" strokeWidth={2.5} />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="display truncate text-xs font-bold">{m.name.split(" ")[0]}</div>
                    <div className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-primary">
                      {m.role.split("·")[0].trim()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border bg-muted/30 px-5 py-3 text-center text-[11px] text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
            Made in Bharat, for Bharat — every second counts, so do we.
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested profile popup */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {active && (
            <>
              <div className="relative bg-gradient-crimson px-6 pb-16 pt-6 text-white">
                <div aria-hidden className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                {active.isLead && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    <Crown className="h-3 w-3" /> Team Lead
                  </span>
                )}
                <DialogHeader className="mt-2 text-left">
                  <DialogTitle className="sr-only">{active.name}</DialogTitle>
                  <DialogDescription className="sr-only">{active.role}</DialogDescription>
                </DialogHeader>
              </div>
              <div className="relative -mt-12 px-6 pb-6">
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg ring-1 ring-border">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${active.seed}&backgroundColor=${active.bg}`}
                    alt={`${active.name} avatar`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="display text-xl font-bold">{active.name}</h3>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {active.role}
                  </div>
                </div>
                <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">{active.bio}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {active.skills.map((s) => (
                    <span key={s} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <a href="#" aria-label={`${active.name} GitHub`} className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"><Github className="h-3.5 w-3.5" /></a>
                  <a href="#" aria-label={`${active.name} LinkedIn`} className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"><Linkedin className="h-3.5 w-3.5" /></a>
                  <a href="#" aria-label={`Email ${active.name}`} className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"><Mail className="h-3.5 w-3.5" /></a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

