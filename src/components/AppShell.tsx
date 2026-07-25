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
    ? [{ to: "/hospital", label: t("nav.dashboard") }, { to: "/hospital/new-request", label: t("nav.newRequest") }]
    : user?.role === "admin"
    ? [{ to: "/admin", label: t("nav.dashboard") }]
    : [];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-md" />
              <Droplet className="relative h-6 w-6 fill-primary text-primary animate-heartbeat" strokeWidth={1.5} />
            </div>
            <span className="hidden font-black tracking-tight sm:inline">
              <span className="text-gradient-crimson">Blood</span>
              <span className="text-gradient">Bridge</span>
              <span className="ml-0.5 text-[10px] font-bold text-[oklch(0.82_0.14_82)]">AI</span>
            </span>
          </Link>
          <nav className="ml-4 flex flex-1 gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-crimson text-white shadow-[0_8px_24px_-8px_oklch(0.62_0.24_25/0.6)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {user && (
            <Button
              variant="ghost" size="icon" className="relative"
              onClick={() => markAllRead(user.id)} aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-crimson px-1 text-[10px] font-bold text-white glow-primary">
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
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuItem onClick={() => changeLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang("hi")}>हिन्दी</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang("es")}>Español</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.82_0.14_82)]" />
                {user.name}
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
