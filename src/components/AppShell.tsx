import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, type ReactNode } from "react";
import { useCurrentUser, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, Globe, LogOut, Droplet } from "lucide-react";
import type { Lang } from "@/lib/types";

export function AppShell({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation();
  const user = useCurrentUser();
  const { lang, setLang, notifications, markAllRead } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const unread = user ? notifications.filter((n) => n.userId === user.id && !n.read).length : 0;

  const changeLang = (l: Lang) => setLang(l);

  const signOut = () => {
    useStore.getState().switchTo("");
    navigate({ to: "/" });
  };

  const navItems: { to: string; label: string }[] = user?.role === "donor"
    ? [{ to: "/donor", label: t("nav.dashboard") }, { to: "/donor/history", label: t("nav.history") }]
    : user?.role === "hospital"
    ? [
        { to: "/hospital", label: t("nav.dashboard") },
        { to: "/hospital/new-request", label: t("nav.newRequest") },
      ]
    : user?.role === "admin"
    ? [{ to: "/admin", label: t("nav.dashboard") }]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary">
            <Droplet className="h-5 w-5 fill-primary" />
            <span className="hidden sm:inline">BloodBridgeAI</span>
          </Link>
          <nav className="ml-4 flex flex-1 gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => markAllRead(user.id)}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Language">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang("hi")}>हिन्दी</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang("es")}>Español</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user.name}
              </Badge>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
