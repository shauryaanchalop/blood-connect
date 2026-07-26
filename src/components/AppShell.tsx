import { Link, useRouterState, useNavigate, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState, type ReactNode } from "react";
import { useCurrentUser, useStore } from "@/lib/store";
import { TeamDialog } from "@/components/TeamDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell, Globe, LogOut, LayoutDashboard, History, Plus, Droplet, User as UserIcon, BookOpen, ArrowLeft, Users, Sun, Moon,
} from "lucide-react";
import type { Lang } from "@/lib/types";

export function AppShell({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation();
  const user = useCurrentUser();
  const { lang, setLang, notifications, markAllRead, theme, toggleTheme, setTeamOpen } = useStore();
  const navigate = useNavigate();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Track history length after mount so back button state is correct on hydration.
  const [historyLen, setHistoryLen] = useState(1);
  useEffect(() => {
    setHistoryLen(window.history.length);
  }, [pathname]);

  useEffect(() => {
    if (typeof i18n?.changeLanguage === "function" && i18n.language !== lang) i18n.changeLanguage(lang);
  }, [lang, i18n]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const unread = user ? notifications.filter((n) => n.userId === user.id && !n.read).length : 0;
  const signOut = () => {
    useStore.getState().switchTo("");
    navigate({ to: "/" });
  };

  const goBack = () => {
    // Smart back: prefer real history; otherwise, hop to a sensible parent.
    if (historyLen > 1) {
      router.history.back();
      return;
    }
    // Compute a sensible fallback based on the current path.
    const p = pathname;
    if (p.startsWith("/donor/")) return navigate({ to: "/donor" });
    if (p.startsWith("/hospital/requests")) return navigate({ to: "/hospital" });
    if (p.startsWith("/hospital/")) return navigate({ to: "/hospital" });
    if (user?.role === "donor") return navigate({ to: "/donor" });
    if (user?.role === "hospital") return navigate({ to: "/hospital" });
    if (user?.role === "admin") return navigate({ to: "/admin" });
    return navigate({ to: "/" });
  };

  type NavItem = { to?: string; label: string; icon: typeof LayoutDashboard; onClick?: () => void };
  const navItems: NavItem[] =
    user?.role === "donor"
      ? [
          { to: "/donor", label: t("nav.dashboard"), icon: LayoutDashboard },
          { to: "/donor/history", label: t("nav.history"), icon: History },
          { to: "/donor/profile", label: "Profile", icon: UserIcon },
          { to: "/education", label: "Learn", icon: BookOpen },
        ]
      : user?.role === "hospital"
      ? [
          { to: "/hospital", label: t("nav.dashboard"), icon: LayoutDashboard },
          { to: "/hospital/new-request", label: t("nav.newRequest"), icon: Plus },
          { to: "/education", label: "Learn", icon: BookOpen },
        ]
      : user?.role === "admin"
      ? [
          { to: "/admin", label: t("nav.dashboard"), icon: LayoutDashboard },
          { to: "/education", label: "Learn", icon: BookOpen },
        ]
      : [];

  // Team opens the modal instead of navigating
  if (user) navItems.push({ label: "Team", icon: Users, onClick: () => setTeamOpen(true) });

  const roleLabel =
    user?.role === "donor" ? "Donor" : user?.role === "hospital" ? "Hospital" : user?.role === "admin" ? "Admin" : "";
  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
          <div className="flex items-center gap-2.5 px-6 py-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-crimson glow-primary">
              <Droplet className="h-4.5 w-4.5 fill-white text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="display text-lg font-bold tracking-tight">BloodBridge</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/50">AI Emergency</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            <div className="px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/40">
              {roleLabel} workspace
            </div>
            {navItems.map((item) => {
              const active = !!item.to && pathname === item.to;
              const Icon = item.icon;
              const cls = `group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-all ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`;
              if (item.onClick) {
                return (
                  <button key={item.label} onClick={item.onClick} className={cls}>
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              }
              return (
                <Link key={item.to!} to={item.to!} className={cls}>
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="border-t border-sidebar-border p-3">
              <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-foreground">
                  {initials}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-sm font-semibold">{user.name}</div>
                  <div className="truncate text-[11px] text-sidebar-foreground/50">{roleLabel}</div>
                </div>
                <button
                  className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  onClick={signOut}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-3 backdrop-blur-md md:px-8">
            <div className="flex min-w-0 items-center gap-2">
              {/* Back button */}
              <button
                onClick={goBack}
                className="inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-9"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>

              {/* Mobile brand */}
              <div className="flex items-center gap-2 md:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-crimson">
                  <Droplet className="h-4 w-4 fill-white text-white" strokeWidth={2.5} />
                </div>
                <span className="display truncate font-bold">BloodBridge</span>
              </div>

              <div className="hidden md:block">
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {roleLabel} · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </div>
              </div>
            </div>


            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <Globe className="h-3.5 w-3.5" /> {lang.toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLang("en" as Lang)}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang("hi" as Lang)}>हिन्दी</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang("es" as Lang)}>Español</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user && (
                <button
                  className="relative rounded-full border border-border bg-card p-2 hover:text-foreground"
                  onClick={() => markAllRead(user.id)}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-crimson px-1 text-[9px] font-bold text-primary-foreground num">
                      {unread}
                    </span>
                  )}
                </button>
              )}

            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-8 md:py-10 md:pb-10">{children}</main>

          <footer className="mx-auto max-w-7xl px-4 pb-24 text-[11px] text-muted-foreground md:px-8 md:pb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6">
              <span className="font-medium">BloodBridge · AI Emergency Blood Network</span>
              <span className="num">© {new Date().getFullYear()}</span>
            </div>
          </footer>

          {/* Mobile bottom nav */}
          {navItems.length > 0 && (
            <nav
              aria-label="Primary"
              className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg md:hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="mx-auto flex max-w-md items-stretch justify-around">
                {navItems.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-14 min-w-14 flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}

        </div>
      </div>
    </div>
  );
}
