import type { BloodType, Urgency } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export function BloodTypeBadge({ type }: { type: BloodType }) {
  return (
    <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-md bg-primary/10 px-2 font-bold text-primary">
      {type}
    </span>
  );
}

export function UrgencyPill({ urgency }: { urgency: Urgency }) {
  const { t } = useTranslation();
  const cls =
    urgency === "critical"
      ? "bg-destructive text-destructive-foreground"
      : urgency === "high"
      ? "bg-warning text-warning-foreground"
      : "bg-muted text-muted-foreground";
  return (
    <Badge className={`${cls} border-transparent`}>{t(`urgency.${urgency}`)}</Badge>
  );
}
