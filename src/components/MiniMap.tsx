import { MapPin } from "lucide-react";

type Pin = {
  id: string;
  label: string;
  sub?: string;
  seed: string; // used for deterministic position
  accent?: "primary" | "muted" | "warn";
};

// Deterministic 0-1 position from string
function pos(seed: string, salt: string) {
  let h = 2166136261;
  const s = seed + "::" + salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (Math.abs(h) % 1000) / 1000;
}

export function MiniMap({
  pins,
  center = "you",
  height = 260,
}: {
  pins: Pin[];
  center?: string;
  height?: number;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-[oklch(0.98_0.005_20)]"
      style={{ height }}
    >
      {/* grid */}
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-40">
        <defs>
          <pattern id="mm-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0 L0 0 0 28" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mm-grid)" className="text-border" />
      </svg>

      {/* faux roads */}
      <svg aria-hidden viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 220 Q 120 180 200 210 T 400 190" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" fill="none" />
        <path d="M60 0 Q 90 120 40 300" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" fill="none" />
        <path d="M300 0 Q 260 150 340 300" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" fill="none" />
      </svg>

      {/* center "you" pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
        </span>
        <div className="mt-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          You
        </div>
      </div>

      {/* pins */}
      {pins.map((p) => {
        const x = 8 + pos(p.seed, "x") * 84; // 8-92%
        const y = 8 + pos(p.seed, "y") * 78; // 8-86%
        const accent =
          p.accent === "warn"
            ? "bg-[oklch(0.82_0.16_80)] text-black"
            : p.accent === "muted"
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground";
        return (
          <div
            key={p.id}
            className="group absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold shadow-sm ${accent}`}>
              <MapPin className="h-3 w-3" />
              {p.label}
            </div>
            {p.sub && (
              <div className="pointer-events-none mt-0.5 whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground opacity-0 shadow-sm ring-1 ring-border transition-opacity group-hover:opacity-100">
                {p.sub}
              </div>
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-background/70 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground backdrop-blur">
        Live map · demo
      </div>
    </div>
  );
}
