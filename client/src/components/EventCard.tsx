"use client";

import { Badge } from "@/components/ui/badge";
import { shortAddress, getExplorerTxUrl, getEventIcon } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

interface EventCardProps {
  type: string;
  escrow_id: number;
  address: string;
  amount?: number;
  shipment_hash?: string;
  timestamp: number;
  txHash: string;
}

function formatTimestamp(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}

function getEventTitle(type: string): string {
  switch (type) {
    case "escrow_created": return "Escrow Created";
    case "shipment_confirmed": return "Shipment Confirmed";
    case "receipt_confirmed": return "Receipt Confirmed — Funds Released";
    case "dispute_raised": return "Dispute Raised";
    default: return type;
  }
}

function getEventBadgeColor(type: string) {
  switch (type) {
    case "escrow_created": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "shipment_confirmed": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "receipt_confirmed": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "dispute_raised": return "bg-red-500/10 text-red-500 border-red-500/20";
    default: return "";
  }
}

export function EventCard({
  type,
  escrow_id,
  address,
  amount,
  shipment_hash,
  timestamp,
  txHash,
}: EventCardProps) {
  const icon = getEventIcon(type);

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="mt-0.5 text-xl">{icon}</div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{getEventTitle(type)}</span>
          <Badge variant="outline" className={`text-xs ${getEventBadgeColor(type)}`}>
            Escrow #{escrow_id}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          by {shortAddress(address)}
          {amount !== undefined && amount > 0 && (
            <> — {(amount / 10_000_000).toFixed(4)} XLM</>
          )}
          {shipment_hash && (
            <> — Hash: {shortAddress(shipment_hash, 6)}</>
          )}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatTimestamp(timestamp)}</span>
          <a
            href={getExplorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {shortAddress(txHash, 6)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
