"use client";

import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/constants";

export function EscrowStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {status}
    </Badge>
  );
}
