import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { UrgencyPill } from "@/components/blood";
import { BloodCrest, StatCard, CountUp, Sparkline, PulseDot } from "@/components/premium";
import { Badge } from "@/components/ui/badge";
import { Users, Droplet, Building2, Award, TrendingUp, Trophy } from "lucide-react";
import { livesSaved } from "@/lib/ai";
import { BLOOD_TYPES } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Network overview — BloodBridgeAI" },
      { name: "description", content: "Analytics across the BloodBridgeAI network: donors, hospitals, requests, and lives saved." },
      { property: "og:title", content: "Admin overview — BloodBridgeAI" },
      { property: "og:description", content: "Analytics across the network." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const user = useCurrentUser();
  const { users, donors, hospitals, requests, donations } = useStore();
  const { t } = useTranslation();

  if (!user || user.role !== "admin") return <Navigate to="/" />;

  const openReqs = requests.filter((r) => r.status === "open").length;
  const totalUnits = donations.reduce((s, d) => s + d.units, 0);
  const lives = livesSaved(totalUnits);

  // Blood-type distribution across donors
  const dist = BLOOD_TYPES.map((bt) => ({ bt, count: donors.filter((d) => d.bloodType === bt).length }));
  const maxDist = Math.max(...dist.map((d) => d.count), 1);

  // Top donors leaderboard
  const leaderboard = [...donors].sort((a, b) => b.donationCount - a.donationCount).slice(0, 5);

  // Fake weekly trend based on donation count
  const weekly = [3, 5, 4, 7, 6, 9, Math.max(donations.length, 4)];

  return (
    <AppShell>
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs">
          <PulseDot /> <span className="uppercase tracking-[0.18em] text-muted-foreground">Network intel · live</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gradient">Command center</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every heartbeat across the BloodBridgeAI network, in one glance.</p>
      </div>

      {/* Top stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={<CountUp to={users.length} />} sub={`${donors.length} donors · ${hospitals.length} hospitals`} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Open requests" value={<CountUp to={openReqs} />} icon={<Droplet className="h-5 w-5" />} />
        <StatCard label="Units donated" value={<CountUp to={totalUnits} />} icon={<Award className="h-5 w-5" />} accent="gold" />
        <StatCard label="Lives saved" value={<CountUp to={lives} />} sub="WHO estimate" icon={<TrendingUp className="h-5 w-5" />} accent="gold" />
      </div>

      {/* Charts row */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Weekly donations</div>
              <div className="text-2xl font-bold text-gradient">{weekly[weekly.length - 1]} units</div>
            </div>
            <Sparkline data={weekly} height={50} width={140} color="oklch(0.62 0.24 25)" />
          </div>
          <p className="text-xs text-muted-foreground">Trending up · +42% vs. last week</p>
        </div>

        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Donor blood-type distribution</h3>
            <span className="text-xs text-muted-foreground">{donors.length} donors</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {dist.map(({ bt, count }) => {
              const h = Math.max(6, (count / maxDist) * 100);
              return (
                <div key={bt} className="flex flex-col items-center gap-1.5">
                  <div className="flex h-24 w-full items-end">
                    <div className="w-full rounded-t-md bg-gradient-crimson transition-all" style={{ height: `${h}%` }} />
                  </div>
                  <div className="text-[10px] font-bold text-gradient-crimson">{bt}</div>
                  <div className="text-[10px] text-muted-foreground">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard + Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[oklch(0.82_0.14_82)]" />
            <h3 className="font-semibold">Top lifesavers</h3>
          </div>
          <div className="space-y-2">
            {leaderboard.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${i === 0 ? "bg-gradient-gold text-black" : "bg-white/5 text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <BloodCrest type={d.bloodType} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.city}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gradient">{d.donationCount}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">donations</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold">Active requests</h3>
          <div className="space-y-2">
            {requests.slice(0, 6).map((r) => {
              const h = hospitals.find((x) => x.id === r.hospitalId);
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/[0.02] p-3 text-sm">
                  <BloodCrest type={r.bloodType} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{h?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.units}u · {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <UrgencyPill urgency={r.urgency} />
                    <Badge variant={r.status === "open" ? "default" : "secondary"} className={r.status === "open" ? "border-0 bg-gradient-crimson text-white" : ""}>
                      {t(`status.${r.status}`)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
