import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { UrgencyPill } from "@/components/blood";
import { BloodCrest, MatchRing, PulseDot, StatCard, CountUp } from "@/components/premium";
import { MiniMap } from "@/components/MiniMap";
import { CompatibilityModal } from "@/components/CompatibilityModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, History, Award, Flame, Droplet, TrendingUp, CheckCircle2, Info, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { isCompatible, type BloodRequest } from "@/lib/types";
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
  const { donors, hospitals, requests, donations, respondToRequest, completeDonation, notify, updateDonor } = useStore();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<BloodRequest | null>(null);
  const smsShownRef = useRef(false);

  const donor = user ? donors.find((d) => d.userId === user.id) : undefined;

  const myDonations = donor ? donations.filter((d) => d.donorId === donor.id) : [];
  const lives = donor ? livesSaved(donor.donationCount) : 0;
  const daysSinceLast = donor ? daysSince(donor.lastDonation) : 0;
  const eligible = daysSinceLast >= 56;
  const daysToEligible = Math.max(56 - daysSinceLast, 0);

  // Mock SMS reminders — fire once per session
  useEffect(() => {
    if (!donor) return;
    if (smsShownRef.current) return;
    if (donor.reminderEnabled === false) return;
    const timer = setTimeout(() => {
      if (!eligible && daysToEligible <= 14 && daysToEligible > 0) {
        toast.message("📱 SMS reminder", {
          description: `Hi ${donor.name.split(" ")[0]}, you'll be eligible to donate again in ${daysToEligible} day${daysToEligible === 1 ? "" : "s"}. Reply STOP to opt out.`,
          duration: 6000,
        });
        notify(donor.userId, `SMS: Eligible to donate in ${daysToEligible} days.`);
      } else if (eligible && donor.donationCount > 0) {
        toast.message("📱 SMS reminder", {
          description: `Hi ${donor.name.split(" ")[0]}, you're eligible to donate again. Save a life this week.`,
          duration: 6000,
        });
      }
      smsShownRef.current = true;
    }, 900);
    return () => clearTimeout(timer);
  }, [donor, eligible, daysToEligible, notify]);

  if (!user) return <Navigate to="/" />;
  if (user.role !== "donor") return <Navigate to="/" />;
  if (!donor) return <Navigate to="/" />;


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
    if (status === "accepted") {
      const req = requests.find((r) => r.id === rid);
      const hosp = req && hospitals.find((h) => h.id === req.hospitalId);
      toast.success("You're on the way — hospital notified.", {
        description: hosp ? `📱 SMS sent to ${hosp.name}: "${donor.name} is en route with ${donor.bloodType}."` : undefined,
      });
    } else {
      toast.info("Response recorded.");
    }
    setSelected(null);
  };

  const handleComplete = (rid: string) => {
    const donation = completeDonation(rid, donor.id);
    if (donation) {
      toast.success(`Certificate ${donation.certificateId} ready.`, { description: "Downloading your PDF…" });
      const hospital = hospitals.find((h) => h.id === donation.hospitalId);
      generateCertificatePdf({ donation, donorName: donor.name, hospitalName: hospital?.name ?? "" });
    }
  };

  const toggleAvailability = () => {
    const next = !(donor.available !== false);
    updateDonor(donor.id, { available: next });
    toast.message("📱 SMS reminder", {
      description: next
        ? `Availability turned ON. We'll SMS you the moment a compatible request opens near ${donor.city}.`
        : "Availability paused. You won't receive SMS alerts until you turn it back on.",
    });
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
                  {eligible ? "Eligible to donate" : `Eligible in ${daysToEligible}d`}
                </span>
                <button
                  onClick={toggleAvailability}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    donor.available !== false
                      ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                      : "border-border bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                  aria-pressed={donor.available !== false}
                >
                  <MessageSquare className="h-3 w-3" />
                  SMS {donor.available !== false ? "on" : "off"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <StatCard label="Lives saved" value={<CountUp to={lives} />} sub="Est. WHO × 3" icon={<Award className="h-5 w-5" />} accent="gold" />
        <StatCard label="Donations" value={<CountUp to={donor.donationCount} />} sub={<span className="inline-flex items-center gap-1"><Flame className="h-3 w-3 text-[oklch(0.82_0.14_82)]" /> streak of impact</span>} icon={<Droplet className="h-5 w-5" />} />
      </div>

      {/* Map view of live requests */}
      {scored.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Live map</div>
              <p className="text-sm text-muted-foreground">Hospitals near you with active compatible requests.</p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{scored.length} pin{scored.length === 1 ? "" : "s"}</span>
          </div>
          <MiniMap
            pins={scored.slice(0, 8).map(({ r, hospital, dist }) => ({
              id: r.id,
              label: hospital.name.split(" ")[0],
              sub: `${r.bloodType} · ${dist.toFixed(1)} km`,
              seed: hospital.id + r.id,
              accent: r.urgency === "critical" ? "primary" : r.urgency === "high" ? "warn" : "muted",
            }))}
          />
        </div>
      )}

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
                    <Button size="sm" variant="ghost" onClick={() => setSelected(r)} className="rounded-full border border-border/60" aria-label="See why this matches you">
                      <Info className="mr-1 h-3.5 w-3.5" /> Why match?
                    </Button>
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

      {selected && (
        <CompatibilityModal
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
          donor={donor}
          request={selected}
          hospital={hospitals.find((h) => h.id === selected.hospitalId)!}
          alreadyResponded={selected.responses.find((x) => x.donorId === donor.id)?.status}
          onAccept={() => handleRespond(selected.id, "accepted")}
          onDecline={() => handleRespond(selected.id, "declined")}
        />
      )}
    </AppShell>
  );
}
