import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore, useCurrentUser } from "@/lib/store";
import { Globe, ArrowRight } from "lucide-react";
import type { Role } from "@/lib/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BloodDropHero, CountUp } from "@/components/premium";
import { livesSaved } from "@/lib/ai";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BloodBridge — An emergency donor register" },
      { name: "description", content: "A quiet, human register that pairs willing donors with hospitals in the minutes that matter." },
      { property: "og:title", content: "BloodBridge — An emergency donor register" },
      { property: "og:description", content: "A quiet register that pairs donors with hospitals in the minutes that matter." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { i18n } = useTranslation();
  const { users, lang, setLang, switchTo, donors, hospitals, requests, donations } = useStore();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  useEffect(() => { if (i18n.language !== lang) i18n.changeLanguage(lang); }, [lang, i18n]);
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

  const totalUnits = donations.reduce((s, d) => s + d.units, 0);
  const lives = livesSaved(totalUnits) + donors.length * 3;
  const openReqs = requests.filter((r) => r.status === "open").length;
  const today = new Date();
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dateStr = `${DAYS[today.getDay()]}, ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  const roles: { role: Role; label: string; blurb: string }[] = [
    { role: "donor",    label: "Donor",    blurb: "See who needs your blood type nearby, and answer only when you can." },
    { role: "hospital", label: "Hospital", blurb: "Post a request; the register finds compatible donors within minutes." },
    { role: "admin",    label: "Bureau",   blurb: "Oversee the register, the roll of donors, and the day's dispatches." },
  ];

  return (
    <div className="min-h-screen">
      {/* Masthead */}
      <header className="border-b border-ink/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-[11px] tracking-wide text-muted-foreground">
          <span className="num">{dateStr}</span>
          <span className="hidden sm:inline">Vol. I · Emergency Blood Bureau · No. {today.getDate()}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 uppercase tracking-[0.2em] hover:text-foreground">
                <Globe className="h-3 w-3" /> {lang}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("hi")}>हिन्दी</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("es")}>Español</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 border-t border-ink/20 px-6 py-6">
          <div className="serif text-5xl leading-none tracking-tight sm:text-6xl">
            BloodBridge<span className="italic text-oxblood">.</span>
          </div>
          <div className="text-right text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            An emergency<br />donor register
          </div>
        </div>
      </header>

      {/* Hero: two-column editorial */}
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-10">
        <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-oxblood" />
          <span>Today's roll · {openReqs} open request{openReqs === 1 ? "" : "s"}</span>
          <span className="hidden h-px flex-1 bg-ink/20 sm:block" />
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <h1 className="serif text-[3.4rem] leading-[0.95] tracking-tight sm:text-[4.6rem]">
              A quiet register<br />
              for the <em className="italic text-oxblood">minutes</em><br />
              that decide a life.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-foreground/80 drop-cap">
              BloodBridge is a bureau, not an app. It keeps a plain list of people willing to give and hospitals willing to ask, and pairs them by type, proximity, and eligibility — in the order a careful nurse would. No fanfare. No push. Just a line, a name, and an address.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <a
                href="#roles"
                className="group inline-flex items-baseline gap-2 border-b border-ink pb-1 serif text-lg leading-none hover:text-oxblood"
              >
                Read on
                <ArrowRight className="h-4 w-4 translate-y-0.5 transition-transform group-hover:translate-x-1" />
              </a>
              <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Est. reading · 40 seconds
              </span>
            </div>
          </div>

          <div className="md:col-span-4">
            <figure className="paper-card p-6">
              <BloodDropHero className="mx-auto h-56 w-auto" />
              <figcaption className="mt-4 border-t border-ink/20 pt-3 text-center text-[11px] italic text-muted-foreground">
                Fig. 1 — <span className="not-italic uppercase tracking-[0.2em]">Type O, universal</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Datasheet strip */}
      <section className="border-y border-ink/20 bg-ink/[0.02]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-ink/15 md:grid-cols-4">
          {[
            { k: "Est. lives", v: <CountUp to={lives} /> },
            { k: "Donors on roll", v: <CountUp to={donors.length} /> },
            { k: "Hospitals", v: <CountUp to={hospitals.length} /> },
            { k: "Units logged", v: <CountUp to={totalUnits} /> },
          ].map((s) => (
            <div key={s.k} className="px-6 py-6">
              <div className="kicker">{s.k}</div>
              <div className="mt-2 serif text-4xl leading-none">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — three columns, no icons, no cards */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-baseline justify-between border-b border-ink/20 pb-3">
          <h2 className="serif text-3xl">How the bureau works</h2>
          <span className="kicker">§ i — iv</span>
        </div>
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { n: "i",   t: "A request arrives",  d: "A hospital enters a type, a number of units, and the urgency of the case." },
            { n: "ii",  t: "The list is read",   d: "The register orders compatible donors by proximity, recency, and reliability." },
            { n: "iii", t: "Notes go out",       d: "Only those actually able to give in time are contacted. No mass alerts." },
            { n: "iv",  t: "A record is kept",   d: "Each donation earns a numbered certificate and enters the day's roll." },
          ].map((s) => (
            <div key={s.n}>
              <div className="serif text-4xl italic leading-none text-oxblood">{s.n}.</div>
              <h3 className="mt-3 serif text-xl">{s.t}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role picker as an editorial table */}
      <section id="roles" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-baseline justify-between border-b border-ink/20 pb-3">
          <h2 className="serif text-3xl">Choose your entry</h2>
          <span className="kicker">Demo desks · sign in</span>
        </div>

        <div className="divide-y divide-ink/20 border-y border-ink/20">
          {roles.map(({ role, label, blurb }) => (
            <div key={role} className="grid gap-6 py-8 md:grid-cols-12">
              <div className="md:col-span-3">
                <div className="kicker">— The {label.toLowerCase()}</div>
                <h3 className="mt-2 serif text-3xl">{label}</h3>
              </div>
              <p className="text-[14px] leading-relaxed text-foreground/85 md:col-span-5">{blurb}</p>
              <div className="md:col-span-4">
                <div className="kicker mb-2">Demo desks</div>
                <ul className="divide-y divide-ink/15 border-t border-b border-ink/20">
                  {usersByRole(role).map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => pickUser(u.id, role)}
                        className="group flex w-full items-center justify-between py-2 text-left text-[14px] hover:text-oxblood"
                      >
                        <span>{u.name}</span>
                        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-oxblood">
                          Enter →
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[11px] italic text-muted-foreground">
          A prototype register. All entries live only in your browser. No accounts, no sign-up, no telemetry.
        </p>
      </section>
    </div>
  );
}
