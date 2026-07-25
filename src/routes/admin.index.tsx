import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BloodTypeBadge, UrgencyPill } from "@/components/blood";
import { Badge } from "@/components/ui/badge";
import { Users, Droplet, Building2, Award } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — BloodBridgeAI" },
      { name: "description", content: "Network overview: users, requests, donations." },
      { property: "og:title", content: "Admin — BloodBridgeAI" },
      { property: "og:description", content: "Network overview." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const user = useCurrentUser();
  const { users, donors, hospitals, requests, donations } = useStore();
  const { t } = useTranslation();

  if (!user || user.role !== "admin") return <Navigate to="/" />;

  const openReqs = requests.filter((r) => r.status === "open").length;
  const totalUnits = donations.reduce((s, d) => s + d.units, 0);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold">{t("admin.title")}</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Stat icon={Users} label={t("admin.users")} value={users.length} />
        <Stat icon={Building2} label="Hospitals" value={hospitals.length} />
        <Stat icon={Droplet} label={`${t("admin.requests")} (open)`} value={openReqs} />
        <Stat icon={Award} label={`${t("admin.donations")} (units)`} value={totalUnits} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Donors ({donors.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {donors.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <div className="flex items-center gap-2">
                  <BloodTypeBadge type={d.bloodType} />
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.city}</div>
                  </div>
                </div>
                <Badge variant="secondary">{d.donationCount} donations</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {requests.map((r) => {
              const h = hospitals.find((x) => x.id === r.hospitalId);
              return (
                <div key={r.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BloodTypeBadge type={r.bloodType} />
                    <div>
                      <div className="font-medium">{h?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.units}u · {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UrgencyPill urgency={r.urgency} />
                    <Badge variant={r.status === "open" ? "default" : "secondary"}>
                      {t(`status.${r.status}`)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
