import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { BloodTypeBadge, UrgencyPill } from "@/components/blood";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle } from "lucide-react";
import { BLOOD_TYPES } from "@/lib/types";

export const Route = createFileRoute("/hospital/")({
  head: () => ({
    meta: [
      { title: "Hospital dashboard — BloodBridgeAI" },
      { name: "description", content: "Manage blood inventory and emergency requests." },
      { property: "og:title", content: "Hospital dashboard — BloodBridgeAI" },
      { property: "og:description", content: "Manage inventory and emergency requests." },
    ],
  }),
  component: HospitalDashboard,
});

function HospitalDashboard() {
  const user = useCurrentUser();
  const { hospitals, requests } = useStore();
  const { t } = useTranslation();

  if (!user || user.role !== "hospital") return <Navigate to="/" />;
  const hospital = hospitals.find((h) => h.userId === user.id);
  if (!hospital) return <Navigate to="/" />;

  const myRequests = requests.filter((r) => r.hospitalId === hospital.id);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">{hospital.name}</h1>
          <p className="text-sm text-muted-foreground">
            {hospital.address} · {hospital.city}
          </p>
        </div>
        <Button asChild>
          <Link to="/hospital/new-request">
            <Plus className="mr-2 h-4 w-4" />
            {t("hospital.postRequest")}
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("hospital.inventory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {BLOOD_TYPES.map((bt) => {
              const units = hospital.inventory[bt] || 0;
              const low = units < 3;
              return (
                <div
                  key={bt}
                  className={`rounded-lg border p-3 text-center ${low ? "border-destructive/40 bg-destructive/5" : "border-border"}`}
                >
                  <div className="text-lg font-bold text-primary">{bt}</div>
                  <div className="text-xl font-semibold">{units}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {low && <AlertTriangle className="mx-auto h-3 w-3 text-destructive" />}
                    {t("hospital.units")}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">{t("hospital.myRequests")}</h2>
      {myRequests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No requests yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myRequests.map((r) => (
            <Link
              key={r.id}
              to="/hospital/requests/$id"
              params={{ id: r.id }}
              className="block"
            >
              <Card className="transition-colors hover:border-primary">
                <CardContent className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-3">
                    <BloodTypeBadge type={r.bloodType} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {r.units} {t("hospital.units")}
                        </span>
                        <UrgencyPill urgency={r.urgency} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()} · {r.responses.length}{" "}
                        {t("hospital.responses").toLowerCase()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={r.status === "open" ? "default" : "secondary"}>
                    {t(`status.${r.status}`)}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
