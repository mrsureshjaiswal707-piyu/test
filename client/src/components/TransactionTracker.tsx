"use client";

import { Badge } from "@/components/ui/badge";
import { shortAddress, getExplorerTxUrl } from "@/lib/constants";
import { ExternalLink, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import type { TransactionRecord } from "@/types";

function formatTimestamp(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Pending
        </Badge>
      );
    case "success":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Success
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

interface TransactionRowProps {
  tx: TransactionRecord;
}

function TransactionRow({ tx }: TransactionRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <StatusIcon status={tx.status} />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium capitalize">{tx.type.replace(/_/g, " ")}</span>
          <StatusBadge status={tx.status} />
        </div>
        <div className="text-xs text-muted-foreground">
          <span>{shortAddress(tx.from)}</span>
          {tx.amount !== undefined && (
            <span> — {(tx.amount / 10_000_000).toFixed(4)} XLM</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatTimestamp(tx.timestamp)}</span>
          <a
            href={getExplorerTxUrl(tx.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {shortAddress(tx.hash, 6)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {tx.error && (
          <p className="mt-1 text-xs text-red-500">{tx.error}</p>
        )}
      </div>
    </div>
  );
}

interface TransactionTrackerProps {
  transactions: TransactionRecord[];
}

export function TransactionTracker({ transactions }: TransactionTrackerProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          No transactions yet. Create an escrow to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <TransactionRow key={tx.hash} tx={tx} />
      ))}
    </div>
  );
}
