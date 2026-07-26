import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplet, ArrowLeft, HeartPulse, ShieldCheck, Clock, Users } from "lucide-react";
import { BLOOD_TYPES, isCompatible, type BloodType } from "@/lib/types";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Learn about donation — BloodBridge" },
      { name: "description", content: "Everything a donor should know: eligibility, safety, blood-type compatibility, and preparing for your donation." },
      { property: "og:title", content: "Learn about blood donation — BloodBridge" },
      { property: "og:description", content: "Eligibility, safety, compatibility, and preparation for donors." },
    ],
  }),
  component: Education,
});

const FACTS = [
  { icon: HeartPulse, k: "1 donation", v: "up to 3 lives saved" },
  { icon: Clock,      k: "8–10 min",  v: "actual draw time" },
  { icon: Users,      k: "1 in 7",    v: "hospital patients needs blood" },
  { icon: ShieldCheck,k: "56 days",   v: "between whole-blood donations" },
];

const ELIGIBILITY = [
  { ok: true,  t: "18–65 years old" },
  { ok: true,  t: "At least 50 kg (110 lb)" },
  { ok: true,  t: "Feeling well and rested" },
  { ok: false, t: "Cold, flu or fever in last 7 days" },
  { ok: false, t: "Tattoo/piercing in last 3 months" },
  { ok: false, t: "Donated whole blood in the last 56 days" },
];

const FAQ = [
  { q: "Does it hurt?", a: "A brief pinch when the needle goes in. The actual draw is painless for most donors." },
  { q: "How long does the whole visit take?", a: "About 45 minutes end-to-end — screening, donation, and a short rest with snacks." },
  { q: "Is my data safe?", a: "BloodBridge only shares your phone number once you accept a request. Everything else stays private." },
  { q: "Can I donate on medication?", a: "Most common medications are fine. The clinic will confirm on arrival." },
];

function CompatibilityMatrix() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full border-collapse text-center text-xs">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Donor ↓ / Recipient →
            </th>
            {BLOOD_TYPES.map((b) => (
              <th key={b} className="p-3 text-[11px] font-bold num">{b}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BLOOD_TYPES.map((donor) => (
            <tr key={donor} className="border-t border-border">
              <td className="p-3 text-left text-[11px] font-bold num">{donor}</td>
              {BLOOD_TYPES.map((rec) => {
                const ok = isCompatible(donor as BloodType, rec as BloodType);
                return (
                  <td key={rec} className="p-2">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${
                        ok ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground/40"
                      }`}
                    >
                      {ok ? "✓" : "·"}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Education() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-crimson glow-primary">
            <Droplet className="h-4 w-4 fill-white text-white" strokeWidth={2.5} />
          </div>
          <span className="display text-lg font-bold tracking-tight">BloodBridge</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
          <HeartPulse className="h-3.5 w-3.5" /> Donor education
        </div>
        <h1 className="display mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Everything you need to know before <span className="text-gradient-crimson">rolling up a sleeve</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A quick, honest guide to eligibility, safety, and how one donation can help up to three patients.
        </p>

        {/* Facts */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FACTS.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.k} className="glass p-5">
                <Icon className="h-5 w-5 text-primary" />
                <div className="mt-3 display text-2xl font-bold num">{f.k}</div>
                <div className="text-xs text-muted-foreground">{f.v}</div>
              </div>
            );
          })}
        </div>

        {/* Eligibility */}
        <section className="mt-14">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Eligibility</div>
          <h2 className="display mt-2 text-2xl font-bold tracking-tight">Can I donate today?</h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {ELIGIBILITY.map((e) => (
              <div
                key={e.t}
                className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                  e.ok ? "border-primary/25 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    e.ok ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {e.ok ? "✓" : "×"}
                </span>
                {e.t}
              </div>
            ))}
          </div>
        </section>

        {/* Compatibility */}
        <section className="mt-14">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Compatibility</div>
          <h2 className="display mt-2 text-2xl font-bold tracking-tight">Who your blood type can help</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            BloodBridge only alerts you for requests you're actually compatible with — but here's the full matrix.
          </p>
          <div className="mt-5">
            <CompatibilityMatrix />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">FAQ</div>
          <h2 className="display mt-2 text-2xl font-bold tracking-tight">Common questions</h2>
          <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">
                  {f.q}
                  <span className="text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <h3 className="display text-xl font-bold">Ready to be someone's minutes matter?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Register once. We'll only ping you when you can truly help.</p>
          <Link
            to="/donor/register"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-crimson px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary"
          >
            Become a donor
          </Link>
        </div>
      </main>
    </div>
  );
}
