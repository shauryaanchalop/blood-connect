import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore, useCurrentUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Droplet, Building2, ShieldCheck, Globe, ArrowRight, Sparkles, Zap, MapPin, Award, Activity } from "lucide-react";
import type { Role } from "@/lib/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BloodDropHero, CountUp, PulseDot } from "@/components/premium";
import { livesSaved } from "@/lib/ai";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BloodBridgeAI — AI emergency blood matching" },
      { name: "description", content: "AI-powered platform matching blood donors with hospitals in critical emergencies. Save lives in minutes." },
      { property: "og:title", content: "BloodBridgeAI" },
      { property: "og:description", content: "AI-powered emergency blood donor matching." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, i18n } = useTranslation();
  const { users, lang, setLang, switchTo, donors, hospitals, requests, donations } = useStore();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  useEffect(() => { if (i18n.language !== lang) i18n.changeLanguage(lang); }, [lang, i18n]);
  useEffect(() => {
    if (currentUser) {
      navigate({ to: currentUser.role === "donor" ? "/donor" : currentUser.role === "hospital" ? "/hospital" : "/admin" });
    }
  }, [currentUser, navigate]);

  const usersByRole = (role: Role) => users.filter((u) => u.role === role);
  const pickUser = (userId: string, role: Role) => {
    switchTo(userId);
    navigate({ to: role === "donor" ? "/donor" : role === "hospital" ? "/hospital" : "/admin" });
  };

  const totalUnits = donations.reduce((s, d) => s + d.units, 0);
  const lives = livesSaved(totalUnits) + donors.length * 3;
  const openReqs = requests.filter((r) => r.status === "open").length;

  const roleCards: { role: Role; icon: typeof Droplet; label: string; desc: string; accent: string }[] = [
    { role: "donor", icon: Droplet, label: t("landing.donor"), desc: t("landing.donorDesc"), accent: "from-[oklch(0.62_0.24_25)] to-[oklch(0.72_0.22_30)]" },
    { role: "hospital", icon: Building2, label: t("landing.hospital"), desc: t("landing.hospitalDesc"), accent: "from-[oklch(0.5_0.2_340)] to-[oklch(0.62_0.24_25)]" },
    { role: "admin", icon: ShieldCheck, label: t("landing.admin"), desc: t("landing.adminDesc"), accent: "from-[oklch(0.78_0.15_82)] to-[oklch(0.62_0.24_25)]" },
  ];

  const features = [
    { icon: Sparkles, title: "AI match engine", desc: "Ranks donors by blood type, distance, recency & reliability in real time." },
    { icon: Zap, title: "Sub-minute alerts", desc: "Compatible donors nearby get pinged the moment a request opens." },
    { icon: MapPin, title: "Geo-aware routing", desc: "Distance & ETA baked into every match so hospitals see the fastest path." },
    { icon: Award, title: "Digital certificates", desc: "Every donation issues a verifiable, downloadable certificate of impact." },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Grid backdrop */}
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-md" />
            <Droplet className="relative h-7 w-7 fill-primary text-primary animate-heartbeat" strokeWidth={1.5} />
          </div>
          <div className="text-lg font-black tracking-tight">
            <span className="text-gradient-crimson">Blood</span>
            <span className="text-gradient">Bridge</span>
            <span className="ml-1 rounded-md bg-[oklch(0.82_0.14_82)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[oklch(0.82_0.14_82)]">AI</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 rounded-full border border-border/60 bg-white/5">
              <Globe className="h-4 w-4" /> {lang.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass">
            <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("hi")}>हिन्दी</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("es")}>Español</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <PulseDot />
            <span className="uppercase tracking-[0.18em]">Live · {openReqs} open request{openReqs === 1 ? "" : "s"}</span>
          </div>
          <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient">Every second</span>
            <br />
            <span className="text-gradient-crimson">saves a life.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            AI-matched donors. Real-time hospital alerts. A single bridge between someone
            willing to give and someone fighting to live.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="group h-12 rounded-full bg-gradient-crimson px-6 text-base font-semibold text-white shadow-[0_20px_50px_-10px_oklch(0.62_0.24_25/0.6)] hover:opacity-90"
                    onClick={() => document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" })}>
              Enter platform
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="ghost" className="h-12 rounded-full border border-border/60 bg-white/5 px-6 text-base">
              <Activity className="mr-2 h-4 w-4" /> Watch demo
            </Button>
          </div>

          {/* Live metrics */}
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            <MetricPill label="Lives saved" value={<CountUp to={lives} />} />
            <MetricPill label="Donors" value={<CountUp to={donors.length} />} />
            <MetricPill label="Hospitals" value={<CountUp to={hospitals.length} />} />
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="absolute inset-0 animate-float-slow">
            <BloodDropHero className="h-full w-full" />
          </div>
          {/* Orbiting badges */}
          <div className="absolute inset-0">
            {["O-", "A+", "B+", "AB-"].map((bt, i) => (
              <div key={bt} className="absolute left-1/2 top-1/2 h-full w-full"
                   style={{ transform: `rotate(${i * 90}deg)` }}>
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
                     style={{ transform: `translate(-50%, -50%) rotate(${-i * 90}deg)` }}>
                  <div className="glass rounded-xl px-3 py-1.5 font-bold text-primary">{bt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="glass group relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl transition-opacity group-hover:opacity-80" />
              <div className="relative">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-crimson text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role picker */}
      <section id="roles" className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[oklch(0.82_0.14_82)]">Choose your role</div>
          <h2 className="text-4xl font-black tracking-tight">
            <span className="text-gradient">Step into </span>
            <span className="text-gradient-crimson">the bridge</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roleCards.map(({ role, icon: Icon, label, desc, accent }) => (
            <div key={role} className="glass group relative flex flex-col overflow-hidden rounded-3xl p-6 transition-all hover:-translate-y-1 hover:ring-glow">
              <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-3xl transition-opacity group-hover:opacity-40`} />
              <div className="relative">
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">{label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
              <div className="relative mt-6 space-y-2">
                <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Demo accounts</div>
                {usersByRole(role).map((u) => (
                  <button key={u.id} onClick={() => pickUser(u.id, role)}
                          className="group/btn flex w-full items-center justify-between rounded-xl border border-border/60 bg-white/[0.03] px-4 py-2.5 text-sm font-medium transition-all hover:border-primary/50 hover:bg-primary/10">
                    <span>{u.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover/btn:translate-x-1 group-hover/btn:text-primary" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Prototype — all data lives locally in your browser. No accounts required.
        </p>
      </section>

      <footer className="relative border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        Crafted with care · BloodBridgeAI · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="text-2xl font-bold text-gradient">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    </div>
  );
}
