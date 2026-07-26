import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { BLOOD_TYPES, type BloodType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Droplet, ShieldCheck, ArrowRight, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/donor/register")({
  head: () => ({
    meta: [
      { title: "Become a donor — BloodBridge" },
      { name: "description", content: "Join BloodBridge as a donor. Get matched to compatible emergency requests near you." },
      { property: "og:title", content: "Become a donor — BloodBridge" },
      { property: "og:description", content: "Join BloodBridge as a donor in under a minute." },
    ],
  }),
  component: DonorRegister,
});

function DonorRegister() {
  const registerDonor = useStore((s) => s.registerDonor);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bloodType, setBloodType] = useState<BloodType>("O+");
  const [city, setCity] = useState("Mumbai");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<string>("");
  const [consent, setConsent] = useState(false);

  const canSubmit = name.trim().length > 1 && phone.trim().length >= 6 && consent;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please complete the required fields and consent.");
      return;
    }
    const ageNum = age ? Math.max(18, Math.min(65, parseInt(age, 10) || 0)) : undefined;
    registerDonor({ name: name.trim(), bloodType, city: city.trim(), phone: phone.trim(), age: ageNum });
    toast.success("Welcome to BloodBridge — your profile is live.");
    navigate({ to: "/donor" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-crimson glow-primary">
            <Droplet className="h-4 w-4 fill-white text-white" strokeWidth={2.5} />
          </div>
          <span className="display text-lg font-bold tracking-tight">BloodBridge</span>
        </Link>
        <Link to="/education" className="text-xs font-medium text-muted-foreground hover:text-foreground">
          Learn about donation →
        </Link>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 pb-16 pt-6 md:grid-cols-[1.1fr_1fr] md:pt-10">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
            <Heart className="h-3.5 w-3.5" /> Become a donor
          </div>
          <h1 className="display mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            One profile. <span className="text-gradient-crimson">Up to three lives</span> every donation.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Register once and BloodBridge will only ping you when a hospital near you needs your specific blood type — never spam, always eligible.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { t: "Compatibility-only alerts", d: "You'll only hear about requests your blood type can actually help." },
              { t: "Eligibility protection", d: "We automatically hide requests until your 56-day interval clears." },
              { t: "Privacy by default", d: "Your phone number is only shared once you accept a request." },
            ].map((f) => (
              <li key={f.t} className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{f.t}</div>
                  <div className="text-xs text-muted-foreground">{f.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <form onSubmit={submit} className="glass rounded-2xl p-6">
          <div className="mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 1 of 1</div>
            <h2 className="display mt-1 text-xl font-bold">Your donor profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aditi Sharma" className="mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Blood type *</Label>
                <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                  {BLOOD_TYPES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBloodType(b)}
                      className={`rounded-lg border px-1 py-2 text-xs font-bold transition-all ${
                        bloodType === b
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))} placeholder="18–65" className="mt-1.5" />
                <p className="mt-1 text-[10px] text-muted-foreground">Donors must be 18–65.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" className="mt-1.5" />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[oklch(0.58_0.22_25)]"
              />
              <span>
                I confirm the information is accurate and consent to being notified for compatible emergency requests near {city || "my city"}.
              </span>
            </label>
          </div>

          <Button type="submit" disabled={!canSubmit} className="mt-6 w-full rounded-full bg-gradient-crimson py-6 text-sm font-semibold text-primary-foreground glow-primary">
            Join the network
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            Prototype · data stays in your browser
          </p>
        </form>
      </main>
    </div>
  );
}
