import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";
import type { BloodType } from "@/lib/types";

// Animated number counter
export function CountUp({ to, duration = 1200, prefix = "", suffix = "" }: {
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
  return <span>{prefix}{n.toLocaleString()}{suffix}</span>;
}

// Animated blood drop hero
export function BloodDropHero({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-crimson blur-3xl opacity-40 animate-pulse-ring" />
      <div className="absolute inset-8 rounded-full border border-primary/30 animate-pulse-ring" style={{ animationDelay: "0.4s" }} />
      <div className="absolute inset-16 rounded-full border border-primary/20 animate-pulse-ring" style={{ animationDelay: "0.8s" }} />
      <div className="relative flex h-full w-full items-center justify-center animate-heartbeat">
        <div className="relative">
          <Droplet className="h-32 w-32 fill-primary text-primary drop-shadow-[0_0_30px_oklch(0.72_0.26_22/0.6)]" strokeWidth={1} />
          <div className="absolute left-1/2 top-1/3 h-8 w-2 -translate-x-1/2 rounded-full bg-gradient-to-b from-white/60 to-transparent blur-sm" />
        </div>
      </div>
    </div>
  );
}

// AI match score ring
export function MatchRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 100);
    return () => clearTimeout(t);
  }, [score]);
  const dash = c * (progress / 100);
  const color = score >= 85 ? "oklch(0.82 0.15 82)" : score >= 65 ? "oklch(0.72 0.22 30)" : "oklch(0.65 0.15 40)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth="6" fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.2,0.8,0.2,1)", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-bold text-gradient">{Math.round(progress)}</div>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">match</div>
      </div>
    </div>
  );
}

// Pulse dot for live indicators
export function PulseDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-2 w-2 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
    </span>
  );
}

// Sparkline
export function Sparkline({ data, color = "oklch(0.62 0.24 25)", height = 40, width = 120 }: {
  data: number[]; color?: string; height?: number; width?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#sp-${color})`} />
    </svg>
  );
}

// Blood type crest — premium replacement for badge
export function BloodCrest({ type, size = "md", glow = false }: {
  type: BloodType; size?: "sm" | "md" | "lg"; glow?: boolean;
}) {
  const dims = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-8 w-8 text-[10px]" : "h-12 w-12 text-sm";
  return (
    <div className={`relative inline-flex ${dims} shrink-0 items-center justify-center rounded-xl bg-gradient-crimson font-black tracking-tight text-white ${glow ? "glow-primary" : ""}`}
         style={{ boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.3), 0 8px 20px -6px oklch(0.62 0.24 25 / 0.5)" }}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
      <span className="relative">{type}</span>
    </div>
  );
}

// Compact stat card
export function StatCard({ label, value, sub, icon, accent }: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; icon?: React.ReactNode; accent?: "gold" | "crimson";
}) {
  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-30 ${accent === "gold" ? "bg-[oklch(0.82_0.14_82)]" : "bg-primary"}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
          <div className={`mt-2 text-3xl font-bold ${accent === "gold" ? "text-gradient" : "text-gradient-crimson"}`}>{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        {icon && <div className="text-primary/70">{icon}</div>}
      </div>
    </div>
  );
}
