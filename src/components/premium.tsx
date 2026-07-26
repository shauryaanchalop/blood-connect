import { useEffect, useState, type ReactNode } from "react";
import type { BloodType } from "@/lib/types";

// Animated number counter
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

// Modern blood drop with gradient + heartbeat
export function BloodDropHero({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden>
      <defs>
        <linearGradient id="drop-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.68 0.24 25)" />
          <stop offset="100%" stopColor="oklch(0.42 0.20 25)" />
        </linearGradient>
        <radialGradient id="drop-highlight" cx="35%" cy="60%" r="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="animate-heartbeat" style={{ transformOrigin: "100px 130px" }}>
        <path
          d="M100 10 C 100 10, 30 110, 30 170 A 70 70 0 0 0 170 170 C 170 110, 100 10, 100 10 Z"
          fill="url(#drop-grad)"
        />
        <path
          d="M100 10 C 100 10, 30 110, 30 170 A 70 70 0 0 0 170 170 C 170 110, 100 10, 100 10 Z"
          fill="url(#drop-highlight)"
        />
      </g>
    </svg>
  );
}

// Match score ring — clean modern gauge
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
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" className="text-muted" strokeWidth="6" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className="text-primary"
          stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.2,0.7,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <div className="display text-xl font-bold">{Math.round(progress)}</div>
        <div className="mt-0.5 text-[8px] uppercase tracking-[0.25em] text-muted-foreground">match</div>
      </div>
    </div>
  );
}

export function PulseDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-2 w-2 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary/50" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
    </span>
  );
}

export function Sparkline({ data, color, height = 36, width = 120 }: {
  data: number[]; color?: string; height?: number; width?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  const stroke = color || "var(--primary)";
  const area = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polygon points={area} fill={stroke} opacity="0.12" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Blood-type crest — modern pill
export function BloodCrest({ type, size = "md", glow = false }: {
  type: BloodType; size?: "sm" | "md" | "lg"; glow?: boolean;
}) {
  const dim = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-8 w-8 text-[11px]" : "h-11 w-11 text-sm";
  return (
    <span className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full bg-gradient-crimson font-bold tracking-tight ${glow ? "glow-primary" : ""}`}>
      {type}
    </span>
  );
}

// Stat card — modern
export function StatCard({ label, value, sub, icon, accent }: {
  label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; accent?: "gold" | "default";
}) {
  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em]">{label}</span>
        {icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent === "gold" ? "bg-primary/10 text-primary" : "bg-muted text-foreground/70"}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 display text-3xl font-bold leading-none num">{value}</div>
      {sub && <div className="mt-2 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
