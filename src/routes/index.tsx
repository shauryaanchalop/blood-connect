import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore, useCurrentUser } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Building2, ShieldCheck, Globe } from "lucide-react";
import type { Role } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BloodBridgeAI — Save lives, one match at a time" },
      { name: "description", content: "Pick your role and start matching donors with hospitals in emergencies." },
      { property: "og:title", content: "BloodBridgeAI — Save lives, one match at a time" },
      { property: "og:description", content: "AI-powered emergency blood donor matching." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, i18n } = useTranslation();
  const { users, lang, setLang, switchTo } = useStore();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang);
  }, [lang, i18n]);

  useEffect(() => {
    if (currentUser) {
      navigate({ to: currentUser.role === "donor" ? "/donor" : currentUser.role === "hospital" ? "/hospital" : "/admin" });
    }
  }, [currentUser, navigate]);

  const usersByRole = (role: Role) => users.filter((u) => u.role === role);

  const pickUser = (userId: string, role: Role) => {
    switchTo(userId);
    navigate({ to: role === "donor" ? "/donor" : role === "hospital" ? "/hospital" : "/admin" });
  };

  const roleCards: { role: Role; icon: typeof Droplet; label: string; desc: string }[] = [
    { role: "donor", icon: Droplet, label: t("landing.donor"), desc: t("landing.donorDesc") },
    { role: "hospital", icon: Building2, label: t("landing.hospital"), desc: t("landing.hospitalDesc") },
    { role: "admin", icon: ShieldCheck, label: t("landing.admin"), desc: t("landing.adminDesc") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/40">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 font-bold text-primary">
          <Droplet className="h-6 w-6 fill-primary" />
          <span className="text-lg">BloodBridgeAI</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              {lang.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("hi")}>हिन्दी</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("es")}>Español</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10 text-center sm:py-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Live demo prototype
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("app.name")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("app.tagline")}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("landing.pickRole")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {roleCards.map(({ role, icon: Icon, label, desc }) => (
            <Card key={role} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{label}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-2">
                {usersByRole(role).map((u) => (
                  <Button
                    key={u.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => pickUser(u.id, role)}
                  >
                    {u.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prototype uses seeded demo accounts. All data is stored locally in your browser.
        </p>
      </section>
    </div>
  );
}
