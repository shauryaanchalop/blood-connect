import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { BloodTypeBadge, UrgencyPill } from "@/components/blood";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CheckCircle2, Phone, MapPin } from "lucide-react";
import { isCompatible } from "@/lib/types";
import { toast } from "sonner";

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

function RequestDetail() {
  const { id } = Route.useParams();
  const user = useCurrentUser();
  const { hospitals, donors, requests, completeDonation } = useStore();
  const { t } = useTranslation();

  if (!user || user.role !== "hospital") return <Navigate to="/" />;
  const hospital = hospitals.find((h) => h.userId === user.id);
  const req = requests.find((r) => r.id === id);
  if (!hospital || !req || req.hospitalId !== hospital.id) return <Navigate to="/hospital" />;

  const matches = donors.filter(
    (d) => isCompatible(d.bloodType, req.bloodType) && d.city === hospital.city,
  );
  const acceptedIds = new Set(
    req.responses.filter((r) => r.status === "accepted").map((r) => r.donorId),
  );

  const onComplete = (donorId: string) => {
    const donation = completeDonation(req.id, donorId);
    if (donation) toast.success(t("hospital.completed"));
  };

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="mb-3">
        <Link to="/hospital">
          <ChevronLeft className="mr-1 h-4 w-4" /> {t("common.back")}
        </Link>
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <BloodTypeBadge type={req.bloodType} />
              <div>
                <CardTitle>
                  {req.units} {t("hospital.units")}
                </CardTitle>
                <div className="mt-1 flex items-center gap-2">
                  <UrgencyPill urgency={req.urgency} />
                  <Badge variant={req.status === "open" ? "default" : "secondary"}>
                    {t(`status.${req.status}`)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          {req.note && <p className="mt-3 text-sm text-muted-foreground">"{req.note}"</p>}
        </CardHeader>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">
        {t("hospital.matchedDonors")} ({matches.length})
      </h2>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t("hospital.noMatches")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {matches.map((d) => {
            const response = req.responses.find((r) => r.donorId === d.id);
            const distance = Math.floor(2 + Math.random() * 8);
            return (
              <Card key={d.id}>
                <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <BloodTypeBadge type={d.bloodType} />
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {d.phone}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {d.city} · ~{distance} km
                        </span>
                        <span>{d.donationCount} donations</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {response ? (
                      <Badge
                        variant={response.status === "accepted" ? "default" : "secondary"}
                      >
                        {response.status === "accepted" ? t("donor.accepted") : t("donor.declined")}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Notified</Badge>
                    )}
                    {acceptedIds.has(d.id) && req.status === "open" && (
                      <Button size="sm" onClick={() => onComplete(d.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t("hospital.markComplete")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
