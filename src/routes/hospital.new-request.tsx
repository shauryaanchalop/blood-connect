import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BLOOD_TYPES, type BloodType, type Urgency, isCompatible } from "@/lib/types";
import { toast } from "sonner";
import { Zap, AlertTriangle, Activity, Users, Droplet } from "lucide-react";

export const Route = createFileRoute("/hospital/new-request")({
  head: () => ({
    meta: [
      { title: "New emergency request — BloodBridgeAI" },
      { name: "description", content: "Post a new emergency blood request." },
      { property: "og:title", content: "New emergency request — BloodBridgeAI" },
      { property: "og:description", content: "Post a new emergency blood request." },
    ],
  }),
  component: NewRequest,
});

const URGENCY_META: Record<Urgency, { icon: typeof Zap; color: string; blurb: string }> = {
  critical: { icon: Zap, color: "border-primary/50 bg-primary/10 text-primary", blurb: "Life-threatening · minutes matter" },
  high: { icon: AlertTriangle, color: "border-[oklch(0.82_0.16_80)]/50 bg-[oklch(0.82_0.16_80)]/10 text-[oklch(0.65_0.16_60)]", blurb: "Time-sensitive · within hours" },
  normal: { icon: Activity, color: "border-border bg-muted text-muted-foreground", blurb: "Planned procedure · stock top-up" },
};

function NewRequest() {
  const user = useCurrentUser();
  const { hospitals, donors, createRequest } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [bloodType, setBloodType] = useState<BloodType>("O-");
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState<Urgency>("critical");
  const [note, setNote] = useState("");
  const [patientInfo, setPatientInfo] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [deadlineMins, setDeadlineMins] = useState(60);
  const [locationOverride, setLocationOverride] = useState("");

  if (!user || user.role !== "hospital") return <Navigate to="/" />;
  const hospital = hospitals.find((h) => h.userId === user.id);
  if (!hospital) return <Navigate to="/" />;

  // Live donor pool estimate (used to reassure the operator before submit)
  const matchingDonors = useMemo(
    () => donors.filter((d) => isCompatible(d.bloodType, bloodType) && d.city === hospital.city),
    [donors, bloodType, hospital.city],
  );

  const submit = () => {
    if (units < 1) return;
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error("Add a contact name and phone so responding donors can reach you.");
      return;
    }
    const req = createRequest({
      hospitalId: hospital.id,
      bloodType,
      units,
      urgency,
      note: note.trim() || undefined,
      patientInfo: patientInfo.trim() || undefined,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      deadlineMins,
      locationOverride: locationOverride.trim() || undefined,
    });
    toast.success(
      `Request posted · ${matchingDonors.length} compatible donor${matchingDonors.length === 1 ? "" : "s"} notified`,
      { description: `📱 SMS blast queued for ${bloodType} donors in ${hospital.city}.` },
    );
    navigate({ to: "/hospital/requests/$id", params: { id: req.id } });
  };

  const UIcon = URGENCY_META[urgency].icon;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Emergency intake</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Post a blood request</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Details help our AI reach the right donors first. All fields marked with an asterisk are required.
          </p>
        </div>

        <Card className="border-border">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplet className="h-4 w-4 text-primary" />
              {hospital.name} · {hospital.city}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {/* Blood type grid */}
            <div className="grid gap-2">
              <Label>Blood type needed *</Label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBloodType(b)}
                    className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      bloodType === b
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                    aria-pressed={bloodType === b}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Users className="h-3 w-3" />
                <span className="num font-semibold text-foreground">{matchingDonors.length}</span>
                compatible donor{matchingDonors.length === 1 ? "" : "s"} in {hospital.city}
              </div>
            </div>

            {/* Units + deadline */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Units needed *</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20}
                  value={units}
                  onChange={(e) => setUnits(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                />
                <div className="text-[11px] text-muted-foreground">
                  ≈ {units * 3} lives potentially saved
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Needed within (minutes) *</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={1440}
                  value={deadlineMins}
                  onChange={(e) => setDeadlineMins(Math.max(5, Math.min(1440, Number(e.target.value) || 60)))}
                />
                <div className="text-[11px] text-muted-foreground">
                  Deadline: {new Date(Date.now() + deadlineMins * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>

            {/* Urgency segmented */}
            <div className="grid gap-2">
              <Label>Urgency *</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["critical", "high", "normal"] as Urgency[]).map((u) => {
                  const meta = URGENCY_META[u];
                  const Icon = meta.icon;
                  const active = urgency === u;
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      className={`flex min-h-16 flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        active ? meta.color + " shadow-sm" : "border-border bg-card hover:border-primary/30"
                      }`}
                      aria-pressed={active}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">{u}</span>
                      <span className="text-[10px] font-normal leading-tight opacity-80">{meta.blurb}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact person *</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Dr. Nair, ER ward"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Direct phone *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 90000 00000"
                />
              </div>
            </div>

            {/* Location override */}
            <div className="grid gap-2">
              <Label htmlFor="loc">Reporting location</Label>
              <Input
                id="loc"
                value={locationOverride}
                onChange={(e) => setLocationOverride(e.target.value)}
                placeholder={`${hospital.address} — Ward, floor, or gate`}
              />
            </div>

            {/* Patient info */}
            <div className="grid gap-2">
              <Label htmlFor="patient">Patient information</Label>
              <Input
                id="patient"
                value={patientInfo}
                onChange={(e) => setPatientInfo(e.target.value)}
                placeholder="e.g. 45 y/o male, road accident, surgery in 90 min"
              />
            </div>

            {/* Note */}
            <div className="grid gap-2">
              <Label htmlFor="note">Additional notes</Label>
              <Textarea
                id="note"
                maxLength={200}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything donors should know."
              />
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Broadcast preview</div>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  <UIcon className="mr-1 h-3 w-3" /> {urgency}
                </Badge>
              </div>
              <p className="mt-2 text-sm">
                <span className="font-bold">🩸 {urgency.toUpperCase()}:</span> {hospital.name} needs{" "}
                <span className="font-bold">{units} unit{units > 1 ? "s" : ""} of {bloodType}</span> within{" "}
                <span className="font-bold">{deadlineMins} min</span>.
                {patientInfo && <> Patient: {patientInfo}.</>}
                {" "}Reply YES to accept.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => navigate({ to: "/hospital" })} className="sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={submit}
                className="bg-gradient-crimson text-white glow-primary hover:opacity-95 sm:w-auto"
                disabled={!contactName.trim() || !contactPhone.trim()}
              >
                <Zap className="mr-1.5 h-4 w-4" />
                Broadcast to {matchingDonors.length} donor{matchingDonors.length === 1 ? "" : "s"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
