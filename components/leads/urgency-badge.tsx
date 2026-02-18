"use client";

import { Badge } from "@/components/ui/badge";
import { URGENCY_LABELS, URGENCY_COLORS } from "@/lib/utils/status";
import { Urgency } from "@prisma/client";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  urgency: Urgency | null | undefined;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  if (!urgency) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        URGENCY_COLORS[urgency] ?? "bg-gray-100 text-gray-700",
        className
      )}
    >
      {URGENCY_LABELS[urgency] ?? urgency}
    </Badge>
  );
}
