import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { BloodTypeBadge } from "@/components/blood";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Award } from "lucide-react";
import { generateCertificatePdf } from "@/lib/certificate";

export const Route = createFileRoute("/donor/history")({
  head: () => ({
    meta: [
      { title: "Donation history — BloodBridgeAI" },
      { name: "description", content: "Your donation history and downloadable certificates." },
      { property: "og:title", content: "Donation history — BloodBridgeAI" },
      { property: "og:description", content: "Your donation history and certificates." },
    ],
  }),
  component: History,
});

function History() {
  const user = useCurrentUser();
  const { donors, hospitals, donations } = useStore();
  const { t } = useTranslation();

  if (!user || user.role !== "donor") return <Navigate to="/" />;
  const donor = donors.find((d) => d.userId === user.id);
  if (!donor) return <Navigate to="/" />;

  const mine = donations.filter((d) => d.donorId === donor.id);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold">{t("donor.history")}</h1>
      {mine.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t("donor.noHistory")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mine.map((d) => {
            const hosp = hospitals.find((h) => h.id === d.hospitalId);
            return (
              <Card key={d.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <BloodTypeBadge type={d.bloodType} />
                    <div>
                      <CardTitle className="text-base">{hosp?.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.date).toLocaleString()} · {d.units} {t("hospital.units")}
                      </p>
                    </div>
                  </div>
                  <Award className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{d.certificateId}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      generateCertificatePdf({
                        donation: d,
                        donorName: donor.name,
                        hospitalName: hosp?.name ?? "Hospital",
                      })
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("donor.certificate")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
