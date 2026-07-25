import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { BloodTypeBadge, UrgencyPill } from "@/components/blood";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, History } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/donor/")({
  head: () => ({
    meta: [
      { title: "Donor dashboard — BloodBridgeAI" },
      { name: "description", content: "See open blood requests near you and respond to save lives." },
      { property: "og:title", content: "Donor dashboard — BloodBridgeAI" },
      { property: "og:description", content: "See open blood requests near you." },
    ],
  }),
  component: DonorDashboard,
});

function DonorDashboard() {
  const user = useCurrentUser();
  const { donors, hospitals, requests, respondToRequest } = useStore();
  const { t } = useTranslation();

  if (!user) return <Navigate to="/" />;
  if (user.role !== "donor") return <Navigate to="/" />;

  const donor = donors.find((d) => d.userId === user.id);
  if (!donor) return <Navigate to="/" />;

  const matches = requests.filter((r) => {
    if (r.status !== "open") return false;
    const hospital = hospitals.find((h) => h.id === r.hospitalId);
    if (!hospital) return false;
    const compatible = isDonorCompatible(donor.bloodType, r.bloodType);
    return compatible && hospital.city === donor.city;
  });

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("donor.profile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <BloodTypeBadge type={donor.bloodType} />
              <div>
                <div className="font-medium">{donor.name}</div>
                <div className="text-xs text-muted-foreground">{donor.phone}</div>
              </div>
            </div>
            <Row label={t("donor.city")} value={donor.city} />
            <Row label={t("donor.lastDonation")} value={donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : "—"} />
            <Row label={t("donor.totalDonations")} value={String(donor.donationCount)} />
            <Button asChild variant="outline" className="w-full">
              <Link to="/donor/history">
                <History className="mr-2 h-4 w-4" />
                {t("donor.viewHistory")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">{t("donor.openRequests")}</h2>
          {matches.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {t("donor.noRequests")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {matches.map((r) => {
                const hospital = hospitals.find((h) => h.id === r.hospitalId)!;
                const myResponse = r.responses.find((x) => x.donorId === donor.id);
                const distance = Math.floor(2 + Math.random() * 8);
                return (
                  <Card key={r.id}>
                    <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <BloodTypeBadge type={r.bloodType} />
                        <div>
                          <div className="flex items-center gap-2 font-semibold">
                            {hospital.name}
                            <UrgencyPill urgency={r.urgency} />
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {hospital.city} · ~{distance} {t("common.distance")}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(r.createdAt).toLocaleString()}
                            </span>
                            <span>
                              {r.units} {t("hospital.units")} {t("hospital.bloodType").toLowerCase()}
                            </span>
                          </div>
                          {r.note && <p className="mt-2 text-sm text-foreground/80">"{r.note}"</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {myResponse ? (
                          <Badge variant={myResponse.status === "accepted" ? "default" : "secondary"}>
                            {myResponse.status === "accepted" ? t("donor.accepted") : t("donor.declined")}
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                respondToRequest(r.id, donor.id, "declined");
                                toast.info(t("donor.declined"));
                              }}
                            >
                              {t("donor.decline")}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                respondToRequest(r.id, donor.id, "accepted");
                                toast.success(t("donor.accepted"));
                              }}
                            >
                              {t("donor.accept")}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function isDonorCompatible(donor: string, recipient: string) {
  const map: Record<string, string[]> = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"],
  };
  return map[donor]?.includes(recipient) ?? false;
}
