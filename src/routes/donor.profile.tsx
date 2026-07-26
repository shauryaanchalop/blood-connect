import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { BloodCrest, StatCard, CountUp } from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Award, Bell, Calendar, MapPin, Phone, Shield, Trophy, Zap, Sparkles } from "lucide-react";
import { daysSince, livesSaved } from "@/lib/ai";
import { toast } from "sonner";

export const Route = createFileRoute("/donor/profile")({
  head: () => ({
    meta: [
      { title: "My profile — BloodBridge" },
      { name: "description", content: "Manage your donor profile, eligibility, badges, and reminder preferences." },
      { property: "og:title", content: "Donor profile — BloodBridge" },
      { property: "og:description", content: "Your donor profile, eligibility and badges." },
    ],
  }),
  component: DonorProfile,
});

const BADGES = [
  { id: "first",       label: "First drop",     need: 1,  icon: Sparkles },
  { id: "bronze",      label: "Bronze donor",   need: 3,  icon: Award },
  { id: "silver",      label: "Silver donor",   need: 6,  icon: Award },
  { id: "gold",        label: "Gold lifesaver", need: 10, icon: Trophy },
  { id: "rapid",       label: "Rapid responder", need: 2, icon: Zap },
];

function DonorProfile() {
  const user = useCurrentUser();
  const { donors, updateDonor } = useStore();
  if (!user) return <Navigate to="/" />;
  if (user.role !== "donor") return <Navigate to="/" />;
  const donor = donors.find((d) => d.userId === user.id);
  if (!donor) return <Navigate to="/" />;

  const days = daysSince(donor.lastDonation);
  const eligibleIn = Math.max(0, 56 - days);
  const eligible = eligibleIn === 0;
  const nextDate = donor.lastDonation
    ? new Date(new Date(donor.lastDonation).getTime() + 56 * 86400000)
    : null;
  const lives = livesSaved(donor.donationCount);

  return (
    <AppShell>
      {/* Hero card */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="glass relative overflow-hidden rounded-2xl p-6 lg:col-span-2">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <BloodCrest type={donor.bloodType} size="lg" glow />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Donor profile</div>
              <h1 className="text-2xl font-black tracking-tight text-gradient truncate">{donor.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{donor.city}</span>
                <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{donor.phone}</span>
                {donor.age && <span>Age {donor.age}</span>}
              </div>
            </div>
          </div>
        </div>
        <StatCard label="Lives saved" value={<CountUp to={lives} />} sub="WHO × 3 per unit" icon={<Award className="h-5 w-5" />} accent="gold" />
      </div>

      {/* Eligibility */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Eligibility calculator</div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="display text-4xl font-bold num">{eligible ? "Now" : `${eligibleIn}d`}</div>
            <div className="text-sm text-muted-foreground">{eligible ? "you're eligible to donate" : "until next donation"}</div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${eligible ? "bg-[oklch(0.72_0.12_140)]" : "bg-gradient-crimson"}`}
              style={{ width: `${Math.min(100, (days / 56) * 100)}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Last donation</div>
              <div className="mt-1 font-semibold num">
                {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : "—"}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Next eligible</div>
              <div className="mt-1 font-semibold num">
                {nextDate ? nextDate.toLocaleDateString() : "Anytime"}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Preferences</div>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-semibold">Emergency reminders</div>
                  <div className="text-xs text-muted-foreground">Alerts for compatible requests near you</div>
                </div>
              </div>
              <Switch
                checked={donor.reminderEnabled ?? true}
                onCheckedChange={(v) => {
                  updateDonor(donor.id, { reminderEnabled: v });
                  toast.success(v ? "Reminders on" : "Reminders paused");
                }}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-semibold">Available to donate</div>
                  <div className="text-xs text-muted-foreground">Toggle off if travelling or unwell</div>
                </div>
              </div>
              <Switch
                checked={donor.available ?? true}
                onCheckedChange={(v) => {
                  updateDonor(donor.id, { available: v });
                  toast.info(v ? "You're marked available" : "You're paused");
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="p-phone" className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Phone</Label>
                <Input
                  id="p-phone"
                  className="mt-1"
                  value={donor.phone}
                  onChange={(e) => updateDonor(donor.id, { phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="p-city" className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">City</Label>
                <Input
                  id="p-city"
                  className="mt-1"
                  value={donor.city}
                  onChange={(e) => updateDonor(donor.id, { city: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Achievements</div>
            <h2 className="display mt-1 text-xl font-bold">Your badges</h2>
          </div>
          <div className="text-xs text-muted-foreground">
            {donor.donationCount} donation{donor.donationCount === 1 ? "" : "s"} logged
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {BADGES.map((b) => {
            const earned = donor.donationCount >= b.need;
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`rounded-xl border p-4 text-center transition-all ${
                  earned
                    ? "border-primary/30 bg-primary/5"
                    : "border-dashed border-border bg-card/60 opacity-60"
                }`}
              >
                <div
                  className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${
                    earned ? "bg-gradient-crimson text-primary-foreground glow-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-2 text-xs font-semibold">{b.label}</div>
                <div className="text-[10px] text-muted-foreground">
                  {earned ? "Earned" : `${b.need} donations`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
