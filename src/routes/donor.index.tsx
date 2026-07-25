import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { UrgencyPill } from "@/components/blood";
import { BloodCrest, MatchRing, PulseDot, StatCard, CountUp } from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, History, Award, Flame, Droplet, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { isCompatible } from "@/lib/types";
import { matchScore, estimateDistanceKm, eta, livesSaved, daysSince } from "@/lib/ai";
import { generateCertificatePdf } from "@/lib/certificate";

export const Route = createFileRoute("/donor/")({
  head: () => ({
    meta: [
      { title: "Donor dashboard — BloodBridgeAI" },
      { name: "description", content: "See AI-matched blood requests near you and respond to save lives." },
      { property: "og:title", content: "Donor dashboard — BloodBridgeAI" },
      { property: "og:description", content: "AI-matched blood requests near you." },
    ],
  }),
  component: DonorDashboard,
});

function DonorDashboard() {
  const user = useCurrentUser();
  const { donors, hospitals, requests, donations, respondToRequest, completeDonation } = useStore();
  const { t } = useTranslation();

  if (!user) return <Navigate to="/" />;
  if (user.role !== "donor") return <Navigate to="/" />;
  const donor = donors.find((d) => d.userId === user.id);
  if (!donor) return <Navigate to="/" />;

  const myDonations = donations.filter((d) => d.donorId === donor.id);
  const lives = livesSaved(donor.donationCount);
  const daysSinceLast = daysSince(donor.lastDonation);
  const eligible = daysSinceLast >= 56;

  // AI-ranked matches (all cities, then sort)
  const scored = requests
    .filter((r) => r.status === "open" && isCompatible(donor.bloodType, r.bloodType))
    .map((r) => {
      const hospital = hospitals.find((h) => h.id === r.hospitalId)!;
      return { r, hospital, score: matchScore(donor, r, hospital), dist: estimateDistanceKm(donor.id, hospital.id) };
    })
    .sort((a, b) => b.score - a.score);

  const handleRespond = (rid: string, status: "accepted" | "declined") => {
    respondToRequest(rid, donor.id, status);
    toast[status === "accepted" ? "success" : "info"](
      status === "accepted" ? "You're on the way — hospital notified." : "Response recorded.",
    );
  };

  const handleComplete = (rid: string) => {
    const donation = completeDonation(rid, donor.id);
    if (donation) {
      toast.success(`Certificate ${donation.certificateId} ready.`);
      const hospital = hospitals.find((h) => h.id === donation.hospitalId);
      generateCertificatePdf({ donor, hospital: hospital!, donation });
    }
  };

  return (
    <AppShell>
      {/* Hero row */}
      <div className="mb-8 grid gap-4 lg:grid-cols-4">
        <div className="glass relative overflow-hidden rounded-2xl p-6 lg:col-span-2">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <BloodCrest type={donor.bloodType} size="lg" glow />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Welcome back</div>
              <h1 className="truncate text-2xl font-black tracking-tight text-gradient">{donor.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{donor.city}</span>
                <span className="inline-flex items-center gap-1">
                  <span className={`inline-flex h-1.5 w-1.5 rounded-full ${eligible ? "bg-[oklch(0.72_0.12_140)]" : "bg-[oklch(0.82_0.16_80)]"}`} />
                  {eligible ? "Eligible to donate" : `Eligible in ${Math.max(56 - daysSinceLast, 0)}d`}
                </span>
              </div>
            </div>
          </div>
        </div>
        <StatCard label="Lives saved" value={<CountUp to={lives} />} sub="Est. WHO × 3" icon={<Award className="h-5 w-5" />} accent="gold" />
        <StatCard label="Donations" value={<CountUp to={donor.donationCount} />} sub={<span className="inline-flex items-center gap-1"><Flame className="h-3 w-3 text-[oklch(0.82_0.14_82)]" /> streak of impact</span>} icon={<Droplet className="h-5 w-5" />} />
      </div>

      {/* Matches */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <PulseDot /> AI-matched requests
          </h2>
          <p className="text-sm text-muted-foreground">Ranked by compatibility, distance, and eligibility.</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full border border-border/60">
          <Link to="/donor/history"><History className="mr-2 h-4 w-4" /> History</Link>
        </Button>
      </div>

      {scored.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center">
          <Droplet className="mx-auto h-10 w-10 text-primary/40" />
          <p className="mt-3 text-sm text-muted-foreground">No open requests match you right now.</p>
          <p className="text-xs text-muted-foreground">We'll notify you the second one opens.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scored.map(({ r, hospital, score, dist }) => {
            const mine = r.responses.find((x) => x.donorId === donor.id);
            return (
              <div key={r.id} className="glass group relative overflow-hidden rounded-2xl p-5 transition-all hover:ring-glow">
                <div className={`absolute left-0 top-0 h-full w-1 ${r.urgency === "critical" ? "bg-gradient-crimson" : r.urgency === "high" ? "bg-[oklch(0.82_0.16_80)]" : "bg-[oklch(0.68_0.14_200)]"}`} />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <MatchRing score={score} />
                    <BloodCrest type={r.bloodType} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-bold">{hospital.name}</span>
                        <UrgencyPill urgency={r.urgency} />
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{hospital.city} · {dist.toFixed(1)} km · ~{eta(dist)}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" />{r.units} unit{r.units > 1 ? "s" : ""} needed</span>
                      </div>
                      {r.note && <p className="mt-2 rounded-lg border border-border/60 bg-white/[0.03] px-3 py-1.5 text-xs italic text-foreground/80">"{r.note}"</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mine ? (
                      mine.status === "accepted" ? (
                        <>
                          <Badge className="border-0 bg-[oklch(0.72_0.12_140)]/20 text-[oklch(0.85_0.15_140)]">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Accepted
                          </Badge>
                          <Button size="sm" onClick={() => handleComplete(r.id)} className="rounded-full bg-gradient-gold text-black hover:opacity-90">
                            <Award className="mr-1 h-3 w-3" /> Mark donated
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary">Declined</Badge>
                      )
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => handleRespond(r.id, "declined")} className="rounded-full">
                          Not now
                        </Button>
                        <Button size="sm" onClick={() => handleRespond(r.id, "accepted")} className="rounded-full bg-gradient-crimson text-white glow-primary hover:opacity-90">
                          Accept & save a life
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent donations mini */}
      {myDonations.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recent donations</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {myDonations.slice(0, 4).map((d) => (
              <div key={d.id} className="glass flex items-center justify-between rounded-xl p-3 text-sm">
                <div className="flex items-center gap-3">
                  <BloodCrest type={d.bloodType} size="sm" />
                  <div>
                    <div className="font-medium">{hospitals.find((h) => h.id === d.hospitalId)?.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(d.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-[oklch(0.82_0.14_82)]">{d.certificateId}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
