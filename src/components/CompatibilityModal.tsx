import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BloodCrest, MatchRing } from "@/components/premium";
import { CheckCircle2, XCircle, MapPin, Clock, Heart, Zap, Activity, Award } from "lucide-react";
import type { BloodRequest, Donor, Hospital } from "@/lib/types";
import { isCompatible } from "@/lib/types";
import { estimateDistanceKm, eta, matchScore, daysSince } from "@/lib/ai";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  donor: Donor;
  request: BloodRequest;
  hospital: Hospital;
  onAccept?: () => void;
  onDecline?: () => void;
  alreadyResponded?: "accepted" | "declined";
}

function Row({
  icon: Icon,
  label,
  value,
  score,
  max,
  hint,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  score: number;
  max: number;
  hint: string;
  ok: boolean;
}) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${ok ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="text-sm font-semibold">{value}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold num text-foreground">
            +{Math.round(score)}<span className="text-muted-foreground">/{max}</span>
          </div>
          {ok ? (
            <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-[oklch(0.55_0.16_150)]">
              <CheckCircle2 className="h-3 w-3" /> match
            </div>
          ) : (
            <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
              <XCircle className="h-3 w-3" /> low
            </div>
          )}
        </div>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${ok ? "bg-gradient-crimson" : "bg-muted-foreground/30"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{hint}</div>
    </div>
  );
}

export function CompatibilityModal({ open, onOpenChange, donor, request, hospital, onAccept, onDecline, alreadyResponded }: Props) {
  const compatible = isCompatible(donor.bloodType, request.bloodType);
  const exact = donor.bloodType === request.bloodType;
  const dist = estimateDistanceKm(donor.id, hospital.id);
  const days = daysSince(donor.lastDonation);
  const score = matchScore(donor, request, hospital);

  const compScore = compatible ? (exact ? 40 : 34) : 0;
  const distScore = Math.max(0, 30 - dist * 2.4);
  const eligScore = days >= 90 ? 20 : days >= 56 ? 12 : 4;
  const urgBoost = request.urgency === "critical" ? 6 : request.urgency === "high" ? 3 : 0;
  const rel = Math.min(10, donor.donationCount * 1.5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-primary">Why you're a match</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Our AI ranks compatibility on five signals. Here's your score for this request.
          </DialogDescription>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-4">
          <div className="flex items-center gap-3">
            <BloodCrest type={request.bloodType} size="sm" />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{hospital.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {request.units} unit{request.units > 1 ? "s" : ""} · {request.urgency.toUpperCase()}
              </div>
            </div>
          </div>
          <MatchRing score={score} />
        </div>

        <div className="space-y-2.5">
          <Row
            icon={Heart}
            label="Blood compatibility"
            value={`${donor.bloodType} → ${request.bloodType}`}
            score={compScore}
            max={40}
            ok={compatible}
            hint={
              exact
                ? "Exact match — the safest transfusion path with fewest reactions."
                : compatible
                ? "Cross-compatible — your blood can safely help this recipient."
                : "Not compatible with this request."
            }
          />
          <Row
            icon={MapPin}
            label="Distance"
            value={`${dist.toFixed(1)} km · ~${eta(dist)}`}
            score={distScore}
            max={30}
            ok={dist < 8}
            hint={
              dist < 4
                ? "Very close — arrival in minutes, ideal for critical windows."
                : dist < 8
                ? "Near your location. Reasonable travel time."
                : "Farther away — score is reduced but still helpful."
            }
          />
          <Row
            icon={Clock}
            label="Eligibility window"
            value={days >= 999 ? "First-time donor" : `${days}d since last donation`}
            score={eligScore}
            max={20}
            ok={days >= 56}
            hint={
              days >= 90
                ? "Fully recovered — hemoglobin restored, safe to donate."
                : days >= 56
                ? "Meets the 56-day minimum interval between donations."
                : `Cooldown active — eligible in ${Math.max(56 - days, 0)} days.`
            }
          />
          <Row
            icon={Award}
            label="Reliability"
            value={`${donor.donationCount} lifetime donation${donor.donationCount === 1 ? "" : "s"}`}
            score={rel}
            max={10}
            ok={donor.donationCount > 0}
            hint={
              donor.donationCount >= 5
                ? "Trusted repeat donor — hospitals prioritize your response."
                : donor.donationCount > 0
                ? "You've donated before — trust builds with each donation."
                : "First-time donor — welcome to the network."
            }
          />
          <Row
            icon={Zap}
            label="Urgency boost"
            value={request.urgency}
            score={urgBoost}
            max={6}
            ok={request.urgency !== "normal"}
            hint={
              request.urgency === "critical"
                ? "Life-threatening — every minute matters."
                : request.urgency === "high"
                ? "Time-sensitive procedure scheduled soon."
                : "Non-urgent inventory replenishment."
            }
          />
        </div>

        {/* Total */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider">Overall AI score</span>
            </div>
            <div className="text-2xl font-black num text-primary">{score}<span className="text-sm text-muted-foreground">/100</span></div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {alreadyResponded ? (
            <div className="w-full rounded-lg border border-border bg-muted/50 p-3 text-center text-xs text-muted-foreground">
              You've already {alreadyResponded} this request.
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={onDecline} className="flex-1">
                Not now
              </Button>
              <Button
                onClick={onAccept}
                className="flex-1 bg-gradient-crimson text-white hover:opacity-90"
              >
                Accept & notify hospital
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
