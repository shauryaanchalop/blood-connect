import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { BloodTypeBadge, UrgencyPill } from "@/components/blood";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, CheckCircle2, Phone, MapPin, Clock, User as UserIcon,
  Zap, Activity, Users, AlertTriangle, MessageSquare, Timer, Copy,
} from "lucide-react";
import { isCompatible } from "@/lib/types";
import { toast } from "sonner";
import { estimateDistanceKm, eta } from "@/lib/ai";

export const Route = createFileRoute("/hospital/requests/$id")({
  head: () => ({
    meta: [
      { title: "Request details — BloodBridgeAI" },
      { name: "description", content: "Matched donors and responses for this emergency request." },
      { property: "og:title", content: "Request details — BloodBridgeAI" },
      { property: "og:description", content: "Matched donors and responses." },
    ],
  }),
  component: RequestDetail,
});

function formatMinsAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function RequestDetail() {
  const { id } = Route.useParams();
  const user = useCurrentUser();
  const { hospitals, donors, requests, completeDonation } = useStore();
  const { t } = useTranslation();
  const [, forceTick] = useState(0);

  // Tick every 20s to refresh "X min ago" without touching the store
  useEffect(() => {
    const iv = setInterval(() => forceTick((n) => n + 1), 20000);
    return () => clearInterval(iv);
  }, []);

  if (!user || user.role !== "hospital") return <Navigate to="/" />;
  const hospital = hospitals.find((h) => h.userId === user.id);
  const req = requests.find((r) => r.id === id);
  if (!hospital || !req || req.hospitalId !== hospital.id) return <Navigate to="/hospital" />;

  const matches = donors.filter(
    (d) => isCompatible(d.bloodType, req.bloodType) && d.city === hospital.city,
  );
  const responses = req.responses;
  const accepted = responses.filter((r) => r.status === "accepted");
  const declined = responses.filter((r) => r.status === "declined");
  const pending = matches.length - responses.length;
  const acceptedIds = new Set(accepted.map((r) => r.donorId));

  const responseRate = matches.length > 0 ? Math.round((responses.length / matches.length) * 100) : 0;
  const acceptRate = matches.length > 0 ? Math.round((accepted.length / matches.length) * 100) : 0;

  // Deadline countdown
  const deadlineMs = req.deadlineMins
    ? new Date(req.createdAt).getTime() + req.deadlineMins * 60000
    : null;
  const minsLeft = deadlineMs ? Math.floor((deadlineMs - Date.now()) / 60000) : null;
  const overdue = minsLeft !== null && minsLeft < 0;

  const onComplete = (donorId: string) => {
    const donation = completeDonation(req.id, donorId);
    if (donation) {
      const d = donors.find((x) => x.id === donorId);
      toast.success(`${d?.name ?? "Donor"} confirmed · certificate ${donation.certificateId} issued`);
    }
  };

  const copyShare = () => {
    const text = `🩸 ${req.urgency.toUpperCase()}: ${hospital.name} needs ${req.units}u ${req.bloodType}${
      req.deadlineMins ? ` within ${req.deadlineMins}min` : ""
    }. Contact ${req.contactName ?? hospital.name} at ${req.contactPhone ?? "(hospital)"}. Reply to accept.`;
    navigator.clipboard?.writeText(text).then(
      () => toast.success("SMS broadcast text copied"),
      () => toast.error("Copy failed"),
    );
  };

  // Build a chronological feed of events
  const feed: { at: string; kind: "created" | "notified" | "accepted" | "declined" | "fulfilled"; label: string }[] = [
    { at: req.createdAt, kind: "created", label: `Request broadcast to ${matches.length} compatible donor${matches.length === 1 ? "" : "s"}` },
    ...responses.map((r) => {
      const d = donors.find((x) => x.id === r.donorId);
      return {
        at: r.at,
        kind: r.status,
        label: `${d?.name ?? "Donor"} ${r.status} · ${d?.bloodType ?? ""}`,
      } as const;
    }),
    ...(req.status === "fulfilled" ? [{ at: new Date().toISOString(), kind: "fulfilled" as const, label: "Request fulfilled" }] : []),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="mb-3">
        <Link to="/hospital">
          <ChevronLeft className="mr-1 h-4 w-4" /> {t("common.back")}
        </Link>
      </Button>

      {/* Hero */}
      <Card className="mb-5 overflow-hidden">
        <div className={`h-1 w-full ${req.urgency === "critical" ? "bg-gradient-crimson" : req.urgency === "high" ? "bg-[oklch(0.82_0.16_80)]" : "bg-muted"}`} />
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <BloodTypeBadge type={req.bloodType} />
              <div className="min-w-0">
                <CardTitle className="text-2xl">
                  {req.units} unit{req.units > 1 ? "s" : ""} of {req.bloodType}
                </CardTitle>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <UrgencyPill urgency={req.urgency} />
                  <Badge variant={req.status === "open" ? "default" : "secondary"} className={req.status === "fulfilled" ? "bg-[oklch(0.72_0.12_140)]/20 text-[oklch(0.45_0.15_150)] border-0" : ""}>
                    {req.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Posted {formatMinsAgo(req.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyShare}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy SMS text
              </Button>
            </div>
          </div>

          {/* Deadline */}
          {minsLeft !== null && req.status === "open" && (
            <div className={`mt-4 flex items-center gap-2 rounded-lg border p-3 ${overdue ? "border-primary/40 bg-primary/10 text-primary" : minsLeft < 15 ? "border-[oklch(0.82_0.16_80)]/40 bg-[oklch(0.82_0.16_80)]/10" : "border-border bg-muted/40"}`}>
              <Timer className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {overdue ? `${Math.abs(minsLeft)} min past deadline` : `${minsLeft} min until deadline`}
              </span>
            </div>
          )}

          {/* Meta */}
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {req.patientInfo && (
              <div className="flex items-start gap-2">
                <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Patient</div>
                  <div>{req.patientInfo}</div>
                </div>
              </div>
            )}
            {req.contactName && (
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</div>
                  <div>{req.contactName}{req.contactPhone && <span className="text-muted-foreground"> · {req.contactPhone}</span>}</div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Location</div>
                <div>{req.locationOverride || hospital.address}</div>
              </div>
            </div>
            {req.note && (
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Note</div>
                  <div className="italic">"{req.note}"</div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Live stats */}
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notified</div>
          <div className="mt-1 text-2xl font-black num">{matches.length}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Users className="h-3 w-3" /> compatible donors</div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Accepted</div>
          <div className="mt-1 text-2xl font-black num text-primary">{accepted.length}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><CheckCircle2 className="h-3 w-3" /> {acceptRate}% acceptance</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Declined</div>
          <div className="mt-1 text-2xl font-black num">{declined.length}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><AlertTriangle className="h-3 w-3" /> unavailable</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pending</div>
          <div className="mt-1 text-2xl font-black num">{Math.max(pending, 0)}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="h-3 w-3" /> awaiting reply</div>
        </div>
      </div>

      {/* Fulfilment progress */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Response rate</span>
          <span className="num text-muted-foreground">{responseRate}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-crimson transition-all" style={{ width: `${responseRate}%` }} />
        </div>
      </div>

      {/* Two column: donors + feed */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Users className="h-4 w-4 text-primary" /> Matched donors ({matches.length})
          </h2>

          {matches.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No compatible donors in {hospital.city} right now.</p>
                <p className="text-xs text-muted-foreground">We're expanding the radius automatically.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {matches
                .slice()
                .sort((a, b) => {
                  const rank = (id: string) => {
                    const r = responses.find((x) => x.donorId === id);
                    if (!r) return 1;
                    return r.status === "accepted" ? 0 : 2;
                  };
                  return rank(a.id) - rank(b.id);
                })
                .map((d) => {
                  const response = responses.find((r) => r.donorId === d.id);
                  const distance = estimateDistanceKm(d.id, hospital.id);
                  return (
                    <Card key={d.id} className={response?.status === "accepted" ? "border-primary/40 bg-primary/[0.03]" : ""}>
                      <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <BloodTypeBadge type={d.bloodType} />
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{d.name}</div>
                            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {d.phone}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {distance.toFixed(1)} km · ~{eta(distance)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Activity className="h-3 w-3" /> {d.donationCount} donation{d.donationCount === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {response ? (
                            response.status === "accepted" ? (
                              <Badge className="border-0 bg-[oklch(0.72_0.12_140)]/20 text-[oklch(0.35_0.14_150)]">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> {t("donor.accepted")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">{t("donor.declined")}</Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <MessageSquare className="mr-1 h-3 w-3" /> SMS sent
                            </Badge>
                          )}
                          {acceptedIds.has(d.id) && req.status === "open" && (
                            <Button size="sm" onClick={() => onComplete(d.id)} className="bg-gradient-crimson text-white">
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              Mark donated
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>

        {/* Live feed */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Zap className="h-4 w-4 text-primary" /> Live activity
          </h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {feed.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 p-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        e.kind === "accepted"
                          ? "bg-[oklch(0.72_0.12_140)]/20 text-[oklch(0.35_0.14_150)]"
                          : e.kind === "declined"
                          ? "bg-muted text-muted-foreground"
                          : e.kind === "fulfilled"
                          ? "bg-gradient-gold text-black"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      {e.kind === "accepted" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : e.kind === "declined" ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : e.kind === "fulfilled" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Zap className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">{e.label}</div>
                      <div className="text-[11px] text-muted-foreground">{formatMinsAgo(e.at)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
