"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils/status";
import { LeadStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800",
        className
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
