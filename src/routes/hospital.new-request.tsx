import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BLOOD_TYPES, type BloodType, type Urgency } from "@/lib/types";
import { toast } from "sonner";

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

function NewRequest() {
  const user = useCurrentUser();
  const { hospitals, createRequest } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [bloodType, setBloodType] = useState<BloodType>("O-");
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState<Urgency>("critical");
  const [note, setNote] = useState("");

  if (!user || user.role !== "hospital") return <Navigate to="/" />;
  const hospital = hospitals.find((h) => h.userId === user.id);
  if (!hospital) return <Navigate to="/" />;

  const submit = () => {
    if (units < 1) return;
    const req = createRequest({
      hospitalId: hospital.id,
      bloodType,
      units,
      urgency,
      note: note.trim() || undefined,
    });
    toast.success("Request posted. Notifying matched donors.");
    navigate({ to: "/hospital/requests/$id", params: { id: req.id } });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-4 text-2xl font-bold">{t("hospital.newRequest")}</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {hospital.name} · {hospital.city}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>{t("hospital.bloodType")}</Label>
              <Select value={bloodType} onValueChange={(v) => setBloodType(v as BloodType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t("hospital.unitsNeeded")}</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={units}
                onChange={(e) => setUnits(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("hospital.urgency")}</Label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">{t("urgency.critical")}</SelectItem>
                  <SelectItem value="high">{t("urgency.high")}</SelectItem>
                  <SelectItem value="normal">{t("urgency.normal")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t("hospital.note")}</Label>
              <Textarea
                maxLength={200}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Trauma patient in ER"
              />
            </div>

            <Button onClick={submit} className="w-full">
              {t("hospital.submit")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
