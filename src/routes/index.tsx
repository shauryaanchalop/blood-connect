import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore, useCurrentUser } from "@/lib/store";
import { Globe, ArrowRight, Droplet, Activity, Shield, Zap, MapPin, Heart, Sparkles, ChevronRight } from "lucide-react";
import type { Role } from "@/lib/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountUp, PulseDot } from "@/components/premium";
import { livesSaved } from "@/lib/ai";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BloodBridge — AI-powered emergency blood network" },
      { name: "description", content: "AI matches donors and hospitals in the minutes that decide a life. Real-time, geo-aware, multilingual." },
      { property: "og:title", content: "BloodBridge — AI-powered emergency blood network" },
      { property: "og:description", content: "AI matches donors and hospitals in the minutes that decide a life." },
    ],
  }),
  component: Landing,
});

const ROLE_META: Record<Role, { label: string; blurb: string; icon: typeof Droplet; accent: string }> = {
  donor:    { label: "Donor",    blurb: "Get matched to compatible requests nearby. Respond in one tap.",             icon: Heart,    accent: "from-primary to-primary/70" },
  hospital: { label: "Hospital", blurb: "Post a request. Our AI finds compatible donors in minutes.",                 icon: Activity, accent: "from-primary to-primary/70" },
  admin:    { label: "Admin",    blurb: "Oversee the network, monitor inventory, dispatch in real time.",             icon: Shield,   accent: "from-primary to-primary/70" },
};

function Landing() {
  const { i18n } = useTranslation();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-crimson glow-primary">
            <Droplet className="h-4.5 w-4.5 fill-white text-white" strokeWidth={2.5} />
          </div>
          <div className="display text-lg font-bold tracking-tight">BloodBridge</div>
          <span className="ml-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs sm:flex">
            <PulseDot /> <span className="font-medium">{openReqs} live request{openReqs === 1 ? "" : "s"}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                <Globe className="h-3.5 w-3.5" /> {lang.toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("hi")}>हिन्दी</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("es")}>Español</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-8 sm:pt-14">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI-matched donors · Real-time dispatch
        </div>
        <h1 className="display max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
          The <span className="text-gradient-crimson">minutes</span> after a call<br className="hidden sm:block" />
          decide a life.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          BloodBridge is an AI-powered emergency network that pairs willing donors with hospitals by blood compatibility, proximity, eligibility, and urgency — in seconds, not hours.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/donor/register"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-crimson px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary transition-transform hover:-translate-y-0.5"
          >
            Become a donor
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#roles"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-accent"
          >
            Try a demo profile
          </a>
          <Link
            to="/education"
            className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Learn about donation →
          </Link>
        </div>

        {/* Stat strip */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Lives saved",   v: <CountUp to={lives} />,            icon: Heart    },
            { k: "Active donors", v: <CountUp to={donors.length} />,    icon: Droplet  },
            { k: "Hospitals",     v: <CountUp to={hospitals.length} />, icon: Activity },
            { k: "Units logged",  v: <CountUp to={totalUnits} />,       icon: MapPin   },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.k} className="glass p-5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em]">{s.k}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 display text-3xl font-bold leading-none num">{s.v}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">How it works</div>
            <h2 className="display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Four steps between a call and a life.</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { n: "01", t: "A request arrives",  d: "Hospital posts type, units, and urgency in under 30 seconds.",           icon: Zap },
            { n: "02", t: "AI ranks donors",    d: "We score every donor by compatibility, distance, eligibility, urgency.", icon: Sparkles },
            { n: "03", t: "Notifications go",   d: "Only donors who can actually reach in time are pinged. No spam.",       icon: Activity },
            { n: "04", t: "A record is kept",   d: "Each donation earns a signed certificate — instantly downloadable.",     icon: Shield },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="glass group relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:ring-glow">
                <div className="flex items-center justify-between">
                  <span className="display text-2xl font-bold text-primary/70 num">{s.n}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="display mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role picker */}
      <section id="roles" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Choose your workspace</div>
            <h2 className="display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Enter as donor, hospital, or admin.</h2>
          </div>
          <div className="hidden text-xs text-muted-foreground sm:block">Demo profiles — no signup</div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(Object.keys(ROLE_META) as Role[]).map((role) => {
            const meta = ROLE_META[role];
            const Icon = meta.icon;
            const roleUsers = usersByRole(role);
            return (
              <div key={role} className="glass group relative flex flex-col overflow-hidden p-6 transition-all hover:-translate-y-1 hover:ring-glow">
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} text-primary-foreground glow-primary`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {roleUsers.length} profile{roleUsers.length === 1 ? "" : "s"}
                  </span>
                </div>
                <h3 className="display mt-5 text-2xl font-bold">{meta.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{meta.blurb}</p>

                <div className="mt-5 space-y-1.5">
                  {roleUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => pickUser(u.id, role)}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5 text-left text-sm transition-all hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span className="font-medium">{u.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Prototype. All data lives in your browser — no accounts, no telemetry.
        </p>
      </section>
    </div>
  );
}
