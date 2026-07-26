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
  return (
    <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
      <DialogContent className="max-w-3xl max-h-[92dvh] overflow-y-auto p-0">
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

        {/* Members */}
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m) => (
            <article
              key={m.name}
              className={`group relative overflow-hidden rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                m.isLead ? "border-primary/40 bg-primary/5" : "border-border bg-card"
              }`}
            >
              {m.isLead && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                  <Crown className="h-2.5 w-2.5" /> Lead
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm ring-1 ring-border">
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
                  <h3 className="display truncate text-sm font-bold">{m.name}</h3>
                  <div className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{m.role}</div>
                </div>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{m.bio}</p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {m.skills.map((s) => (
                  <span key={s} className="rounded-full border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <a href="#" aria-label={`${m.name} GitHub`} className="rounded-full border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground"><Github className="h-3 w-3" /></a>
                <a href="#" aria-label={`${m.name} LinkedIn`} className="rounded-full border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground"><Linkedin className="h-3 w-3" /></a>
                <a href="#" aria-label={`Email ${m.name}`} className="rounded-full border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground"><Mail className="h-3 w-3" /></a>
              </div>
            </article>
          ))}
        </div>

        <div className="border-t border-border bg-muted/30 px-5 py-3 text-center text-[11px] text-muted-foreground">
          <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
          Made in Bharat, for Bharat — every second counts, so do we.
        </div>
      </DialogContent>
    </Dialog>
  );
}
