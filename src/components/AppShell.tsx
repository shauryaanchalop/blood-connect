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
import { Bell, Globe, LogOut } from "lucide-react";
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

  const roleLabel = user?.role === "donor" ? "Donor" : user?.role === "hospital" ? "Hospital" : user?.role === "admin" ? "Bureau" : "";

  return (
    <div className="min-h-screen">
      {/* Editorial masthead */}
      <header className="border-b border-ink/20">
        {/* Top strip: date + issue + language */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-[11px] tracking-wide text-muted-foreground">
          <span className="num">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="hidden sm:inline">Vol. I · Emergency Blood Bureau · No. {new Date().getDate()}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 uppercase tracking-[0.2em] hover:text-foreground">
                <Globe className="h-3 w-3" /> {lang}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang("hi")}>हिन्दी</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang("es")}>Español</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Wordmark + user chip */}
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 border-t border-ink/20 px-6 py-4">
          <Link to="/" className="group flex items-baseline gap-3">
            <span className="serif text-3xl leading-none tracking-tight sm:text-4xl">
              BloodBridge
              <span className="ml-0.5 italic text-oxblood">.</span>
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:inline">
              An emergency donor register
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden text-right text-[11px] leading-tight sm:block">
                  <div className="uppercase tracking-[0.2em] text-muted-foreground">{roleLabel}</div>
                  <div className="font-medium">{user.name}</div>
                </div>
                <button
                  className="relative rounded-full p-1.5 hover:bg-ink/5"
                  onClick={() => markAllRead(user.id)}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-oxblood px-1 text-[9px] font-semibold text-primary-foreground num">
                      {unread}
                    </span>
                  )}
                </button>
                <button className="rounded-full p-1.5 hover:bg-ink/5" onClick={signOut} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Section nav — tab underline */}
        {navItems.length > 0 && (
          <nav className="mx-auto flex max-w-6xl items-center gap-6 border-t border-ink/20 px-6 text-[13px]">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative -mb-px py-2.5 tracking-wide transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-oxblood" />}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>

      <footer className="mx-auto mt-16 max-w-6xl border-t border-ink/20 px-6 py-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>BloodBridge · Emergency Blood Bureau</span>
          <span className="num">Est. {new Date().getFullYear()} · Printed digitally</span>
        </div>
      </footer>
    </div>
  );
}
