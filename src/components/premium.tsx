import { useEffect, useState, type ReactNode } from "react";
import type { BloodType } from "@/lib/types";

// Animated number counter — tabular, restrained
export function CountUp({ to, duration = 900, prefix = "", suffix = "" }: {
  to: number; duration?: number; prefix?: string; suffix?: string;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span className="num">{prefix}{n.toLocaleString()}{suffix}</span>;
}

// Editorial "blood drop" — a hand-set red mark, not a glowing 3D orb
export function BloodDropHero({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden>
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        </pattern>
      </defs>
      <g className="text-oxblood" fill="currentColor">
        <path d="M100 10 C 100 10, 30 110, 30 170 A 70 70 0 0 0 170 170 C 170 110, 100 10, 100 10 Z" />
      </g>
      <path
        d="M100 10 C 100 10, 30 110, 30 170 A 70 70 0 0 0 170 170 C 170 110, 100 10, 100 10 Z"
        fill="url(#hatch)"
        className="text-paper"
      />
      <path
        d="M100 10 C 100 10, 30 110, 30 170 A 70 70 0 0 0 170 170 C 170 110, 100 10, 100 10 Z"
        fill="none" stroke="currentColor" strokeWidth="1.25" className="text-ink"
      />
      {/* Highlight — a hand-drawn crescent */}
      <path d="M65 140 C 65 165, 75 185, 92 195" fill="none" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// Match score — an editorial gauge, not a neon ring
export function MatchRing({ score, size = 84 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 60);
    return () => clearTimeout(t);
  }, [score]);
  const dash = c * (progress / 100);
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" className="text-ink/15" strokeWidth="2" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className="text-oxblood"
          stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="butt"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.2,0.7,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <div className="serif text-2xl">{Math.round(progress)}</div>
        <div className="mt-0.5 text-[8px] uppercase tracking-[0.25em] text-muted-foreground">match</div>
      </div>
    </div>
  );
}

// A single ink dot with a soft ring — used for "live"
export function PulseDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-1.5 w-1.5 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-oxblood/40" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-oxblood" />
    </span>
  );
}

// Simple sparkline in ink
export function Sparkline({ data, color, height = 36, width = 120 }: {
  data: number[]; color?: string; height?: number; width?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  const stroke = color || "var(--oxblood)";
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const cx = i * step;
        const cy = height - ((v - min) / range) * (height - 4) - 2;
        return <circle key={i} cx={cx} cy={cy} r="1.5" fill={stroke} />;
      })}
    </svg>
  );
}

// Blood-type crest — a tidy typographic mark, not a gradient sphere
export function BloodCrest({ type, size = "md" }: {
  type: BloodType; size?: "sm" | "md" | "lg"; glow?: boolean;
}) {
  const dim = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-8 w-8 text-[11px]" : "h-11 w-11 text-sm";
  return (
    <span className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full border border-ink bg-paper font-semibold tracking-tight text-oxblood`}>
      {type}
    </span>
  );
}

// Stat cell — editorial datasheet, not a glass card
export function StatCard({ label, value, sub, icon, accent }: {
  label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; accent?: "gold" | "default";
}) {
  return (
    <div className="paper-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="kicker">{label}</span>
        {icon && <span className={accent === "gold" ? "text-oxblood" : "text-ink/60"}>{icon}</span>}
      </div>
      <div className="mt-2 serif text-4xl leading-none num">{value}</div>
      {sub && <div className="mt-2 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
