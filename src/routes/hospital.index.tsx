import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { UrgencyPill } from "@/components/blood";
import { BloodCrest, StatCard, CountUp, PulseDot } from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, MapPin, Droplet, Activity, Users, Package } from "lucide-react";
import { BLOOD_TYPES } from "@/lib/types";

export const Route = createFileRoute("/hospital/")({
  head: () => ({
    meta: [
      { title: "Hospital control room — BloodBridgeAI" },
      { name: "description", content: "Monitor blood inventory, post emergency requests, and track donor responses in real time." },
      { property: "og:title", content: "Hospital dashboard — BloodBridgeAI" },
      { property: "og:description", content: "Post emergency requests and track donor responses." },
    ],
  }),
  component: HospitalDashboard,
});

function HospitalDashboard() {
  const user = useCurrentUser();
  const { hospitals, requests, donors, donations } = useStore();
  const { t } = useTranslation();

  if (!user || user.role !== "hospital") return <Navigate to="/" />;
  const hospital = hospitals.find((h) => h.userId === user.id);
  if (!hospital) return <Navigate to="/" />;

  const myRequests = requests.filter((r) => r.hospitalId === hospital.id);
  const openCount = myRequests.filter((r) => r.status === "open").length;
  const totalUnits = Object.values(hospital.inventory).reduce((s, n) => s + n, 0);
  const lowCount = BLOOD_TYPES.filter((bt) => (hospital.inventory[bt] || 0) < 3).length;
  const totalResponses = myRequests.reduce((s, r) => s + r.responses.length, 0);
  const receivedUnits = donations.filter((d) => d.hospitalId === hospital.id).reduce((s, d) => s + d.units, 0);

  const maxInv = Math.max(...BLOOD_TYPES.map((bt) => hospital.inventory[bt] || 0), 10);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs">
            <PulseDot /> <span className="uppercase tracking-[0.18em] text-muted-foreground">Control room</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gradient">{hospital.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {hospital.address} · {hospital.city}
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full bg-gradient-crimson text-white glow-primary hover:opacity-90">
          <Link to="/hospital/new-request">
            <Plus className="mr-2 h-4 w-4" /> Post emergency request
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open requests" value={<CountUp to={openCount} />} icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Inventory units" value={<CountUp to={totalUnits} />} sub={lowCount > 0 ? <span className="text-[oklch(0.82_0.16_80)]">{lowCount} type{lowCount > 1 ? "s" : ""} low</span> : "Stable"} icon={<Package className="h-5 w-5" />} accent="gold" />
        <StatCard label="Donor responses" value={<CountUp to={totalResponses} />} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Units received" value={<CountUp to={receivedUnits} />} icon={<Droplet className="h-5 w-5" />} accent="gold" />
      </div>

      {/* Inventory heatmap */}
      <div className="glass mb-8 overflow-hidden rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Inventory heatmap</h2>
            <p className="text-xs text-muted-foreground">Live stock across all blood types. Red bars flag critical low stock.</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {BLOOD_TYPES.map((bt) => {
            const units = hospital.inventory[bt] || 0;
            const low = units < 3;
            const pct = Math.max(4, Math.round((units / maxInv) * 100));
            return (
              <div key={bt} className={`relative overflow-hidden rounded-xl border p-3 text-center transition-all ${low ? "border-primary/40 bg-primary/5" : "border-border/60 bg-white/[0.02]"}`}>
                <div className="absolute inset-x-0 bottom-0" style={{ height: `${pct}%`, background: low
                  ? "linear-gradient(to top, oklch(0.62 0.24 25 / 0.35), transparent)"
                  : "linear-gradient(to top, oklch(0.72 0.12 140 / 0.25), transparent)" }} />
                <div className="relative">
                  <div className="text-sm font-black text-gradient-crimson">{bt}</div>
                  <div className="mt-1 text-2xl font-black">{units}</div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    {low ? <span className="inline-flex items-center gap-0.5 text-[oklch(0.82_0.16_80)]"><AlertTriangle className="h-2.5 w-2.5" /> Low</span> : "units"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Requests */}
      <h2 className="mb-3 text-lg font-bold">Active requests</h2>
      {myRequests.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center">
          <Droplet className="mx-auto h-10 w-10 text-primary/40" />
          <p className="mt-3 text-sm text-muted-foreground">No requests posted yet.</p>
          <Button asChild variant="link" className="text-primary"><Link to="/hospital/new-request">Post your first request →</Link></Button>
        </div>
      ) : (
        <div className="grid max-h-[560px] gap-3 overflow-y-auto rounded-2xl pr-1 [scrollbar-width:thin]">

          {myRequests.map((r) => {
            const accepted = r.responses.filter((x) => x.status === "accepted").length;
            return (
              <Link key={r.id} to="/hospital/requests/$id" params={{ id: r.id }}
                    className="glass group relative overflow-hidden rounded-2xl p-4 transition-all hover:ring-glow">
                <div className={`absolute left-0 top-0 h-full w-1 ${r.urgency === "critical" ? "bg-gradient-crimson" : r.urgency === "high" ? "bg-[oklch(0.82_0.16_80)]" : "bg-[oklch(0.68_0.14_200)]"}`} />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <BloodCrest type={r.bloodType} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{r.units} unit{r.units > 1 ? "s" : ""}</span>
                        <UrgencyPill urgency={r.urgency} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()} · {accepted}/{r.responses.length} accepted
                      </div>
                    </div>
                  </div>
                  <Badge className={r.status === "open" ? "border-0 bg-gradient-crimson text-white" : "border-border/60 bg-white/5"}>
                    {t(`status.${r.status}`)}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
